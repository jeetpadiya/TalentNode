import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import type { Organization } from '../services/organizationSchemas'
import {
  getOrganizationById,
  getOrganizations,
} from '../services/organizationService'
import OrganizationCard from './OrganizationCard'

const OrganizationList = () => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadOrganizations = async () => {
      if (!accessToken) {
        setError('You need to login first.')
        setIsLoading(false)
        return
      }

      try {
        const response = await getOrganizations(accessToken)

        if (isMounted) {
          setOrganizations(response.organizations)
          setError(null)
        }
      } catch (caughtError) {
        const message =
          typeof caughtError === 'object' &&
          caughtError !== null &&
          'message' in caughtError
            ? String(caughtError.message)
            : 'Could not load organization.'

        if (isMounted) {
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrganizations()

    return () => {
      isMounted = false
    }
  }, [accessToken])

  const handleOrganizationClick = async (organizationId: string) => {
    if (!accessToken) {
      setError('You need to login first.')
      return
    }

    try {
      await getOrganizationById(organizationId, accessToken)
      await fetchProfile()
      navigate(`/organizations/${organizationId}/dashboard`)
    } catch (caughtError) {
      const message =
        typeof caughtError === 'object' &&
        caughtError !== null &&
        'message' in caughtError
          ? String(caughtError.message)
          : 'Could not open organization.'

      setError(message)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading organization...</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (organizations.length === 0) {
    return <p className="text-sm text-gray-600">No organizations found.</p>
  }

  return (
    <div className="grid gap-4">
      {organizations.map((organization) => (
        <OrganizationCard
          key={organization.id}
          organization={organization}
          onClick={handleOrganizationClick}
        />
      ))}
    </div>
  )
}

export default OrganizationList
