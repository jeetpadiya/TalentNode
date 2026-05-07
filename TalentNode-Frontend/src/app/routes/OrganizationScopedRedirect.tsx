import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'

type OrganizationScopedRedirectProps = {
  page: 'dashboard' | 'jobs' | 'candidates' | 'applications'
}

const OrganizationScopedRedirect = ({
  page,
}: OrganizationScopedRedirectProps) => {
  const user = useAuthStore((state) => state.user)

  if (!user?.organizationId) {
    return <Navigate to="/organizations/create" replace />
  }

  return (
    <Navigate
      to={`/organizations/${user.organizationId}/${page}`}
      replace
    />
  )
}

export default OrganizationScopedRedirect
