
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'

const PublicRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          user?.organizationId
            ? `/organizations/${user.organizationId}/dashboard`
            : '/organizations/create'
        }
        replace
      />
    )
  }

  return <Outlet />
}

export default PublicRoutes
