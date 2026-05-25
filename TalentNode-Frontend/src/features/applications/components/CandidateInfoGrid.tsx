import { useMemo } from 'react'

import type { Candidate } from '../../candidates/services/CandidateSchema'

type CandidateInfoGridProps = {
  candidate: Candidate
}

const InfoItem = ({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-medium text-gray-900">
      {value || 'Not added'}
    </p>
  </div>
)

const CandidateInfoGrid = ({ candidate }: CandidateInfoGridProps) => {
  const skillText = useMemo(
    () => candidate.skills?.filter(Boolean).join(', ') ?? '',
    [candidate],
  )

  const tagText = useMemo(
    () => candidate.tags?.filter(Boolean).join(', ') ?? '',
    [candidate],
  )

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoItem label="Current role" value={candidate.currentRole} />
        <InfoItem label="Current company" value={candidate.currentCompany} />
        <InfoItem label="Experience" value={candidate.experience ?? null} />
        <InfoItem label="Skills" value={skillText} />
        <InfoItem label="Tags" value={tagText} />
        <InfoItem label="Source" value={candidate.source} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900">Candidate notes</h3>
        <p className="mt-2 whitespace-pre-line rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {candidate.notes || 'No notes added when this candidate was created.'}
        </p>
      </div>
    </div>
  )
}

export default CandidateInfoGrid

