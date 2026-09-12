import type { z } from 'zod'
import { toast } from 'sonner'
import { useAuthStore } from '../app/store/AuthStore'
import { queryClient } from './queryClient'
import { isTokenExpired } from '../utils/jwt'
import type { ApiErrorResponse, ApiFieldError } from '../types/types'

let isSessionExpiring = false

/**
 * Centrally handles session expiration across the application.
 * Deduplicates multiple concurrent 401s, displays a notification,
 * clears the TanStack query cache, wipes the auth store, and redirects to /login.
 */
export const handleSessionExpiry = (
  reason: string = 'Your session has expired. Please log in again.',
) => {
  if (isSessionExpiring) return
  isSessionExpiring = true

  try {
    toast.error(reason)
  } catch {
    // Sonner might not be available in headless context
  }

  try {
    queryClient.clear()
  } catch {
    // ignore
  }

  // Clear Zustand auth store and persisted localStorage
  useAuthStore.getState().logout()

  // Safely redirect to /login if currently inside an authenticated route
  const currentPath = window.location.pathname
  const isAuthRoute =
    currentPath.includes('/login') ||
    currentPath.includes('/register') ||
    currentPath.startsWith('/public/')

  if (!isAuthRoute) {
    const redirectParam = encodeURIComponent(currentPath + window.location.search)
    window.location.replace(`/login?sessionExpired=true&redirect=${redirectParam}`)
  }

  setTimeout(() => {
    isSessionExpiring = false
  }, 2000)
}

/**
 * Standard API error class carrying status code, status text, and response details.
 */
export class ApiError extends Error {
  status: number
  statusText: string
  data: ApiErrorResponse | unknown
  errors?: ApiFieldError[]

  constructor(status: number, statusText: string, data: unknown) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as ApiErrorResponse).message)
        : `HTTP ${status}: ${statusText}`

    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data

    if (
      typeof data === 'object' &&
      data !== null &&
      'errors' in data &&
      Array.isArray((data as ApiErrorResponse).errors)
    ) {
      this.errors = (data as ApiErrorResponse).errors
    }
  }
}

/**
 * Request configuration extending standard RequestInit.
 */
export interface RequestConfig<T = unknown> extends Omit<RequestInit, 'body'> {
  url?: string
  baseURL?: string
  params?: Record<string, unknown>
  data?: unknown
  body?: BodyInit | null
  schema?: z.ZodType<T>
  parser?: (data: unknown) => T
  skipAuth?: boolean
  skipErrorHandling?: boolean
}

type RequestInterceptorHandler = {
  onFulfilled?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onRejected?: (error: unknown) => unknown | Promise<unknown>
}

type ResponseInterceptorHandler = {
  onFulfilled?: (response: Response, data: unknown) => unknown | Promise<unknown>
  onRejected?: (error: ApiError | unknown) => unknown | Promise<unknown>
}

class InterceptorManager<T> {
  private handlers: Array<T | null> = []

  use(handler: T): number {
    this.handlers.push(handler)
    return this.handlers.length - 1
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null
    }
  }

  getHandlers(): T[] {
    return this.handlers.filter((h): h is T => h !== null)
  }
}

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

/**
 * Serialize URL parameters into query string.
 */
const buildUrlWithParams = (url: string, params?: Record<string, unknown>): string => {
  if (!params || Object.keys(params).length === 0) return url

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val))
        }
      })
    } else {
      searchParams.set(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  if (!queryString) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${queryString}`
}

/**
 * Modern, fetch-based HTTP client with interceptor support.
 */
export class ApiClient {
  private baseURL: string

  public interceptors = {
    request: new InterceptorManager<RequestInterceptorHandler>(),
    response: new InterceptorManager<ResponseInterceptorHandler>(),
  }

  constructor(baseURL: string = DEFAULT_BASE_URL) {
    this.baseURL = baseURL.replace(/\/+$/, '')
    this.registerDefaultInterceptors()
  }

  /**
   * Registers default auth, content-type, and error-handling interceptors.
   */
  private registerDefaultInterceptors(): void {
    // 1. Default Request Interceptor: Attach Auth & Content-Type
    this.interceptors.request.use({
      onFulfilled: (config) => {
        const headers = new Headers(config.headers)

        // Inject Authorization bearer token if available
        if (!config.skipAuth && !headers.has('Authorization')) {
          const token = useAuthStore.getState().accessToken
          if (token) {
            if (isTokenExpired(token)) {
              handleSessionExpiry('Your session has expired. Please log in again.')
              return Promise.reject(
                new ApiError(401, 'Unauthorized', {
                  success: false,
                  code: 'TOKEN_EXPIRED',
                  message: 'Your session has expired. Please log in again.',
                }),
              )
            }
            headers.set('Authorization', `Bearer ${token}`)
          }
        }

        // Format body and Content-Type
        let body = config.body
        if (config.data !== undefined) {
          const isSpecialBody =
            config.data instanceof FormData ||
            config.data instanceof URLSearchParams ||
            config.data instanceof Blob

          if (isSpecialBody) {
            body = config.data as BodyInit
          } else {
            if (!headers.has('Content-Type')) {
              headers.set('Content-Type', 'application/json')
            }
            body = JSON.stringify(config.data)
          }
        }

        return {
          ...config,
          headers,
          body,
        }
      },
    })

    // 2. Default Response Interceptor: Parse JSON & handle 401
    this.interceptors.response.use({
      onFulfilled: async (_response, data) => {
        return data
      },
      onRejected: async (error) => {
        if (error instanceof ApiError) {
          // Automatic session expiration handling on 401 Unauthorized for authenticated routes
          if (error.status === 401) {
            const isAuthRoute =
              window.location.pathname.includes('/login') ||
              window.location.pathname.includes('/register')
            if (!isAuthRoute) {
              const errorMessage =
                typeof error.data === 'object' &&
                error.data !== null &&
                'message' in error.data
                  ? String((error.data as { message: unknown }).message)
                  : 'Your session has expired. Please log in again.'
              handleSessionExpiry(errorMessage)
            }
          }
        }
        return Promise.reject(error)
      },
    })
  }

  /**
   * Core request dispatcher executing through interceptors.
   */
  async request<T = unknown>(config: RequestConfig<T>): Promise<T> {
    let currentConfig: RequestConfig = { ...config }

    // Execute request interceptors pipeline
    for (const interceptor of this.interceptors.request.getHandlers()) {
      try {
        if (interceptor.onFulfilled) {
          currentConfig = await interceptor.onFulfilled(currentConfig)
        }
      } catch (err) {
        if (interceptor.onRejected) {
          return Promise.reject(await interceptor.onRejected(err))
        }
        return Promise.reject(err)
      }
    }

    // Resolve URL
    const rawUrl = currentConfig.url ?? ''
    const isAbsolute = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    const base = (currentConfig.baseURL ?? this.baseURL).replace(/\/+$/, '')
    const targetUrl = isAbsolute
      ? rawUrl
      : `${base}/${rawUrl.replace(/^\/+/, '')}`

    const finalUrl = buildUrlWithParams(targetUrl, currentConfig.params)

    // Execute native fetch
    let response: Response
    try {
      response = await fetch(finalUrl, {
        method: currentConfig.method ?? 'GET',
        headers: currentConfig.headers,
        body: currentConfig.body,
        signal: currentConfig.signal,
        credentials: currentConfig.credentials,
        mode: currentConfig.mode,
      })
    } catch (networkError) {
      const err = new ApiError(0, 'Network Error', {
        message:
          networkError instanceof Error
            ? networkError.message
            : 'Network connection error. Please check your internet.',
      })
      for (const interceptor of this.interceptors.response.getHandlers()) {
        if (interceptor.onRejected) {
          return Promise.reject(await interceptor.onRejected(err))
        }
      }
      return Promise.reject(err)
    }

    // Parse response body
    let rawData: unknown = null
    const contentType = response.headers.get('content-type') ?? ''
    if (response.status !== 204 && response.status !== 205) {
      if (contentType.includes('application/json')) {
        try {
          rawData = await response.json()
        } catch {
          rawData = null
        }
      } else {
        try {
          rawData = await response.text()
        } catch {
          rawData = null
        }
      }
    }

    // Handle error status codes
    if (!response.ok) {
      const apiError = new ApiError(response.status, response.statusText, rawData)
      for (const interceptor of this.interceptors.response.getHandlers()) {
        if (interceptor.onRejected) {
          return Promise.reject(await interceptor.onRejected(apiError))
        }
      }
      return Promise.reject(apiError)
    }

    // Execute response interceptors pipeline
    let result: unknown = rawData
    for (const interceptor of this.interceptors.response.getHandlers()) {
      try {
        if (interceptor.onFulfilled) {
          result = await interceptor.onFulfilled(response, result)
        }
      } catch (err) {
        if (interceptor.onRejected) {
          return Promise.reject(await interceptor.onRejected(err))
        }
        return Promise.reject(err)
      }
    }

    // Apply Zod schema or parser if provided
    if (currentConfig.schema) {
      return currentConfig.schema.parse(result) as T
    }
    if (currentConfig.parser) {
      return currentConfig.parser(result) as T
    }

    return result as T
  }

  get<T = unknown>(url: string, config?: Omit<RequestConfig<T>, 'method' | 'url'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig<T>, 'method' | 'url' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig<T>, 'method' | 'url' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig<T>, 'method' | 'url' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }

  delete<T = unknown>(url: string, config?: Omit<RequestConfig<T>, 'method' | 'url'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }
}

/**
 * Singleton API client instance with interceptors configured.
 */
export const client = new ApiClient()

export default client
