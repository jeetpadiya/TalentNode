export interface JwtPayload {
  id?: string
  email?: string
  role?: string
  organizationId?: string | null
  iat?: number
  exp?: number
  [key: string]: unknown
}

/**
 * Safely decodes the payload of a JWT without external dependencies.
 * Handles base64url encoding and UTF-8 characters cleanly.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  if (!token || typeof token !== 'string') return null

  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    // Base64URL to standard Base64
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

    const decodedStr = atob(padded)
    const jsonStr = decodeURIComponent(
      decodedStr
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    return JSON.parse(jsonStr) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Checks if a JWT token is expired.
 * @param token The JWT string to evaluate
 * @param bufferSeconds Buffer time in seconds (default: 5) to prevent race conditions near expiry
 * @returns true if token is missing, malformed, or past its expiration timestamp
 */
export const isTokenExpired = (
  token: string | null | undefined,
  bufferSeconds: number = 5,
): boolean => {
  if (!token) return true

  const payload = decodeJwt(token)
  if (!payload || typeof payload.exp !== 'number') {
    // If token cannot be decoded or lacks an exp claim, consider it expired/invalid
    return true
  }

  const expirationTimeMs = (payload.exp - bufferSeconds) * 1000
  return Date.now() >= expirationTimeMs
}

/**
 * Returns remaining milliseconds until the token expires, or 0 if expired/invalid.
 */
export const getTokenRemainingTimeMs = (token: string | null | undefined): number => {
  if (!token) return 0

  const payload = decodeJwt(token)
  if (!payload || typeof payload.exp !== 'number') return 0

  const remaining = payload.exp * 1000 - Date.now()
  return remaining > 0 ? remaining : 0
}
