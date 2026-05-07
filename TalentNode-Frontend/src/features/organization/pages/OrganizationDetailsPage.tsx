import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import type { Organization } from '../services/organizationSchemas'
import { getOrganizationById } from '../services/organizationService'

const OrganizationDetailsPage = () => {
  const { organizationId } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadOrganization = async () => {
      if (!accessToken || !organizationId) {
        setError('Organization could not be loaded.')
        setIsLoading(false)
        return
      }

      try {
        const response = await getOrganizationById(organizationId, accessToken)

        if (isMounted) {
          setOrganization(response.organization)
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

    void loadOrganization()

    return () => {
      isMounted = false
    }
  }, [accessToken, organizationId])

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading organization...</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-900">
        {organization?.name}
      </h1>
    </section>
  )
}

export default OrganizationDetailsPage
