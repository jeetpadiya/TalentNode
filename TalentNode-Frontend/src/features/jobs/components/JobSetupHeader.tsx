import { FaPlus, FaGlobe, FaEyeSlash } from 'react-icons/fa'

type JobSetupHeaderProps = {
  title: string
  isPublished?: boolean
  status?: string
  isTogglingPublish?: boolean
  canAddCandidate: boolean
  onAddCandidate: () => void
  onTogglePublish?: () => void
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  paused: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800',
  archived: 'bg-slate-100 text-slate-600',
}

const JobSetupHeader = ({
  title,
  isPublished = false,
  status = 'draft',
  isTogglingPublish = false,
  canAddCandidate,
  onAddCandidate,
  onTogglePublish,
}: JobSetupHeaderProps) => {
  return (
    <div className="mb-6 gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {title || 'Job workspace'}
          </h1>

          {/* Status Badge */}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[status] ?? statusColors.draft}`}>
            {status}
          </span>

          {/* Published Badge */}
          {isPublished && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              Live on job board
            </span>
          )}

          <span className="group relative inline-flex">
            <button
              type="button"
              onClick={onAddCandidate}
              disabled={!canAddCandidate}
              aria-label="Add candidate"
              className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaPlus className="h-4 w-4" aria-hidden />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              Add candidate
            </span>
          </span>
        </div>

        {/* Publish / Unpublish Button */}
        {onTogglePublish && (
          <button
            type="button"
            onClick={onTogglePublish}
            disabled={isTogglingPublish}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
              isPublished
                ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-blue-200'
            }`}
          >
            {isPublished ? (
              <><FaEyeSlash className="h-4 w-4" /> {isTogglingPublish ? 'Unpublishing...' : 'Unpublish'}</>
            ) : (
              <><FaGlobe className="h-4 w-4" /> {isTogglingPublish ? 'Publishing...' : 'Publish Job'}</>
            )}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Switch between setup, application form, hiring stages, and hiring team
        for this job.
      </p>
    </div>
  )
}

export default JobSetupHeader
