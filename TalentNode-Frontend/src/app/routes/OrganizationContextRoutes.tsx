import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/AuthStore'
import { getOrganizationById } from '../../features/organization/services/organizationService'

const OrganizationContextRoutes = () => {
  const { organizationId } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidOrganization, setIsValidOrganization] = useState(false)

  useEffect(() => {
    let isMounted = true

    const activateOrganization = async () => {
      setIsLoading(true)
      setIsValidOrganization(false)

      if (!accessToken || !organizationId) {
        setIsValidOrganization(false)
        setIsLoading(false)
        return
      }

      try {
        await getOrganizationById(organizationId, accessToken)
        await fetchProfile()

        if (isMounted) {
          setIsValidOrganization(true)
        }
      } catch {
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
  }, [accessToken, fetchProfile, organizationId])

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading organization...</p>
  }

  if (!isValidOrganization) {
    return <Navigate to="/organizations" replace />
  }

  return <Outlet />
}

export default OrganizationContextRoutes
