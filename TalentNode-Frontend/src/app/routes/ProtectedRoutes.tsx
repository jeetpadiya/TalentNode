import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import { isTokenExpired } from '../../utils/jwt'
import { handleSessionExpiry } from '../../lib/client'

const ProtectedRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const location = useLocation()

  const expired = isTokenExpired(accessToken)

  useEffect(() => {
    if (accessToken && expired) {
      handleSessionExpiry('Your session has expired. Please log in again.')
    }
  }, [accessToken, expired])

  if (!isAuthenticated || expired) {
    return (
      <Navigate
        to={`/login?sessionExpired=true&redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
        state={{ from: location, sessionExpired: true }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoutes
