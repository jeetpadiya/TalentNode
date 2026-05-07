import type { Organization } from '../services/organizationSchemas'

type OrganizationCardProps = {
  organization: Organization
  onClick: (organizationId: string) => void | Promise<void>
}

const OrganizationCard = ({ organization, onClick }: OrganizationCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(organization.id)}
      className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
    >
      {organization.name}
    </button>
  )
}

export default OrganizationCard
