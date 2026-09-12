import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/AuthStore'
import { useOrganizationStore } from '../store/OrganizationStore'
import { isTokenExpired } from '../../utils/jwt'
import { handleSessionExpiry } from '../../lib/client'

const OrganizationContextRoutes = () => {
  const { organizationId } = useParams()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const fetchOrganization = useOrganizationStore((state) => state.fetchOrganization)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidOrganization, setIsValidOrganization] = useState(false)

  useEffect(() => {
    let isMounted = true

    const activateOrganization = async () => {
      setIsLoading(true)
      setIsValidOrganization(false)

      if (!accessToken || !organizationId || isTokenExpired(accessToken)) {
        if (accessToken && isTokenExpired(accessToken)) {
          handleSessionExpiry()
        }
        setIsValidOrganization(false)
        setIsLoading(false)
        return
      }

      try {
        await fetchOrganization(organizationId, accessToken)
        if (!user) {
          await fetchProfile()
        }

        if (isMounted) {
          setIsValidOrganization(true)
        }
      } catch {
        if (accessToken && isTokenExpired(accessToken)) {
          handleSessionExpiry()
        }
        if (isMounted) {
          setIsValidOrganization(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void activateOrganization()

    return () => {
      isMounted = false
    }
  }, [accessToken, fetchProfile, fetchOrganization, organizationId])

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading organization...</p>
  }

  if (!accessToken || isTokenExpired(accessToken)) {
    return <Navigate to="/login?sessionExpired=true" replace />
  }

  if (!isValidOrganization) {
    return <Navigate to="/organizations" replace />
  }

  return <Outlet />
}

export default OrganizationContextRoutes
