import OrganizationList from '../components/OrganizationList'
import { useNavigate } from 'react-router-dom'

export const OrganizationPage = () => {
  const navigate = useNavigate()
  return (
    <section className="flex max-w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Your organization
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This is the workspace connected to your TalentNode account.
        </p>

      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Membership
        </h2>
        <button
          type="button"
          aria-label="Create organization"
          onClick={() => navigate('/organizations/create')}
          className="mb-4 rounded-md border border-gray-300 px-3 py-1 text-lg font-semibold leading-none text-gray-700 hover:bg-gray-50"
        >
          +
        </button>

        <OrganizationList />
      </div>
    </section>
  )
}
