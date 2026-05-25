import type { ApplicationStage } from '../services/ApplicationServices'
import type { Candidate } from '../../candidates/services/CandidateSchema'

type CandidateListProps = {
  activeStage: ApplicationStage | null
  selectedCandidateId: string
  onCandidateSelect: (candidate: Candidate) => void
}

const CandidateList = ({
  activeStage,
  selectedCandidateId,
  onCandidateSelect,
}: CandidateListProps) => {

  const candidateCard = (c: Candidate) => (
    <li
      key={c._id}
    >
      <button
        type="button"
        onClick={() => onCandidateSelect(c)}
        className={[
          'w-full rounded-lg border p-4 text-left transition-colors',
          selectedCandidateId === c._id
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
        ].join(' ')}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate font-semibold">{c.name}</p>
            <p
              className={[
                'truncate text-sm',
                selectedCandidateId === c._id ? 'text-gray-200' : 'text-gray-600',
              ].join(' ')}
            >
              {c.email}
            </p>

            {c.currentRole || c.currentCompany ? (
              <p
                className={[
                  'truncate text-sm',
                  selectedCandidateId === c._id ? 'text-gray-300' : 'text-gray-500',
                ].join(' ')}
              >
                {[c.currentRole, c.currentCompany].filter(Boolean).join(' at ')}
              </p>
            ) : null}
          </div>

          {c.source ? (
            <span
              className={[
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                selectedCandidateId === c._id
                  ? 'bg-white/15 text-white'
                  : 'bg-gray-100 text-gray-800',
              ].join(' ')}
            >
              {c.source}
            </span>
          ) : null}
        </div>
      </button>
    </li>
  )

  return (
    <aside className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:w-80 lg:shrink-0">

      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900">
            {activeStage ? activeStage.name : 'Candidates'}
          </h2>

          <p className="text-sm text-gray-600">
            {activeStage
              ? `${activeStage.candidates?.length ?? 0} candidates in this stage.`
              : 'Select a stage from the sidebar.'}
          </p>
        </div>
      </div>

      {activeStage && (activeStage.candidates?.length ?? 0) === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-6 py-14 text-center">
          No candidates yet
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {activeStage?.candidates?.map(candidateCard)}
        </ul>
      )}
    </aside>
  )
}

export default CandidateList
