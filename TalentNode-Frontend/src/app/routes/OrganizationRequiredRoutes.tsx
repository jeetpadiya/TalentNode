import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'

const OrganizationRequiredRoutes = () => {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user?.organizationId) {
    return (
      <Navigate
        to="/organizations/create"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}

export default OrganizationRequiredRoutes
