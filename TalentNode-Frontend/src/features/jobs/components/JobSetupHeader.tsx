import { FaPlus } from 'react-icons/fa'

type JobSetupHeaderProps = {
  title: string
  canAddCandidate: boolean
  onAddCandidate: () => void
}

const JobSetupHeader = ({
  title,
  canAddCandidate,
  onAddCandidate,
}: JobSetupHeaderProps) => {
  return (
    <div className="mb-6 gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {title || 'Job workspace'}
        </h1>
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
      <p className="mt-2 text-sm text-gray-600">
        Switch between setup, application form, hiring stages, and hiring team
        for this job.
      </p>
    </div>
  )
}

export default JobSetupHeader
