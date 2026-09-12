import { useEffect } from 'react'
import { useAuthStore } from '../app/store/AuthStore'
import { getTokenRemainingTimeMs, isTokenExpired } from '../utils/jwt'
import { handleSessionExpiry } from '../lib/client'

/**
 * Proactively monitors token validity and session expiration:
 * 1. Checks token freshness on window focus and visibility changes (tab wake/restore).
 * 2. Schedules an exact timeout when the JWT expires.
 * 3. Periodically audits token validity to handle system sleep/clock drift.
 */
export const useSessionExpiryMonitor = () => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!accessToken || !isAuthenticated) return

    // 1. Initial sanity check
    if (isTokenExpired(accessToken)) {
      handleSessionExpiry()
      return
    }

    // 2. Set exact timeout for token expiration
    const remainingMs = getTokenRemainingTimeMs(accessToken)
    let expiryTimer: ReturnType<typeof setTimeout> | null = null

    if (remainingMs > 0) {
      expiryTimer = setTimeout(() => {
        handleSessionExpiry('Your session has timed out. Please log in again.')
      }, remainingMs)
    }

    // 3. Listener for tab focus & visibility change (e.g., coming back from another tab or sleep)
    const checkFreshness = () => {
      const currentToken = useAuthStore.getState().accessToken
      if (currentToken && isTokenExpired(currentToken)) {
        handleSessionExpiry()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkFreshness()
      }
    }

    window.addEventListener('focus', checkFreshness)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 4. Periodic background audit (every 60 seconds)
    const intervalTimer = setInterval(checkFreshness, 60_000)

    return () => {
      if (expiryTimer) clearTimeout(expiryTimer)
      clearInterval(intervalTimer)
      window.removeEventListener('focus', checkFreshness)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [accessToken, isAuthenticated])
}
