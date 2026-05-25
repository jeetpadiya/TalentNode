import { NavLink, useParams } from 'react-router-dom'
import { jobWorkspaceSections } from './jobSetupUtils'

const JobWorkspaceTabs = () => {
  const { organizationId, jobId } = useParams()
  const basePath =
    organizationId && jobId
      ? `/organizations/${organizationId}/jobs/${jobId}`
      : ''

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
      {jobWorkspaceSections.map((section) => (
        <NavLink
          key={section.id}
          to={`${basePath}/${section.path}`}
          className={({ isActive }) => [
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
          ].join(' ')}
        >
          {section.label}
        </NavLink>
      ))}
    </div>
  )
}

export default JobWorkspaceTabs
