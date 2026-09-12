import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import { isTokenExpired } from '../../utils/jwt'

const PublicRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const expired = isTokenExpired(accessToken)

  useEffect(() => {
    // If accessToken exists but is expired, purge stale state cleanly
    if (accessToken && expired) {
      logout()
    }
  }, [accessToken, expired, logout])

  // If authentically logged in with a fresh token, forward into dashboard
  if (isAuthenticated && !expired) {
    return (
      <Navigate
        to={
          user?.organizationId
            ? `/organizations/${user.organizationId}/dashboard`
            : '/organizations/new'
        }
        replace
      />
    )
  }

  return <Outlet />
}

export default PublicRoutes
