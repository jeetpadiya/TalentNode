import { create } from 'zustand'
import type { Organization } from '../../features/organization/services/organizationSchemas'
import { getOrganizationById } from '../../features/organization/services/organizationService'

interface OrganizationState {
  currentOrganization: Organization | null
  isLoading: boolean
  error: string | null
  activeOrgId: string | null
  fetchOrganization: (
    organizationId: string,
    accessToken: string,
    force?: boolean,
  ) => Promise<Organization | null>
  clearOrganization: () => void
  setCurrentOrganization: (org: Organization | null) => void
}

// In-flight request cache to deduplicate simultaneous calls across components
const pendingRequests = new Map<string, Promise<Organization | null>>()

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  currentOrganization: null,
  isLoading: false,
  error: null,
  activeOrgId: null,

  setCurrentOrganization: (org) => {
    set({ currentOrganization: org, activeOrgId: org?.id ?? null })
  },

  clearOrganization: () => {
    pendingRequests.clear()
    set({ currentOrganization: null, activeOrgId: null, error: null })
  },

  fetchOrganization: async (organizationId, accessToken, force = false) => {
    const currentState = get()

    // If already loaded for this organizationId and not forcing refresh, return cached instance
    if (
      !force &&
      currentState.currentOrganization &&
      currentState.activeOrgId === organizationId
    ) {
      return currentState.currentOrganization
    }

    const cacheKey = `${organizationId}:${accessToken}`

    // Deduplicate in-flight concurrent requests
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!
    }

    const fetchPromise = (async () => {
      set({ isLoading: true, error: null })
      try {
        const response = await getOrganizationById(organizationId, accessToken)
        const org = response.organization ?? null
        set({
          currentOrganization: org,
          activeOrgId: organizationId,
          isLoading: false,
          error: null,
        })
        return org
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to load organization'
        set({ isLoading: false, error: message })
        throw err
      } finally {
        pendingRequests.delete(cacheKey)
      }
    })()

    pendingRequests.set(cacheKey, fetchPromise)
    return fetchPromise
  },
}))
