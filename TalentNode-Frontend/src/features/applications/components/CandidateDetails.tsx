import { useMemo, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import type { Candidate } from '../../candidates/services/CandidateSchema'

import CandidateHeader from './CandidateHeader'
import RequestReviewModal from './RequestReviewModal'
import CandidateInfoGrid from './CandidateInfoGrid'
import CandidateMoveControls from './CandidateMoveControls'
import CandidateTabs, { type CandidateDetailTab } from './CandidateTabs'
import EditCandidateModal from './EditCandidateModal'

type CandidateDetailsProps = {
  candidate: Candidate | null
  jobId?: string
  stageName?: string
  stages?: Array<{ id: string; name: string }>
  currentStageId?: string
  moveTargetStageId: string
  isMoving?: boolean
  moveError?: string | null
  onMoveTargetStageChange: (stageId: string) => void
  onMoveCandidate: () => void
}

const CandidateDetails = ({
  candidate,
  jobId: jobIdFromPage,
  stageName,
  stages = [],
  currentStageId,
  moveTargetStageId,
  isMoving = false,
  moveError,
  onMoveTargetStageChange,
  onMoveCandidate,
}: CandidateDetailsProps) => {
  const role = useAuthStore((s) => s.user?.role)
  const [activeTab, setActiveTab] = useState<CandidateDetailTab>('notes')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRequestReviewOpen, setIsRequestReviewOpen] = useState(false)

  const canRequestReview = useMemo(
    () =>
      role === 'admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager',
    [role],
  )

  const jobId = candidate?.jobId ?? jobIdFromPage
  const applicationId = candidate?.applicationId ?? undefined

  if (!candidate) {
    return (
      <section className="min-h-[560px] flex-1 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-20 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Select a candidate</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Choose a candidate from the left list to review their profile, activity,
          resume, notes, comments, and reviews.
        </p>
      </section>
    )
  }

  const handleEditCandidate = () => {
    setIsEditModalOpen(true)
  }

  const handleDeleteCandidate = () => {
    // TODO: Call delete candidate API when the backend endpoint is ready.
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  return (
    <section className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white shadow-sm relative">
      {isEditModalOpen ? (
        <EditCandidateModal candidate={candidate} onClose={handleCloseEditModal} />
      ) : null}

      {isRequestReviewOpen &&
      jobId &&
      applicationId &&
      candidate ? (
        <RequestReviewModal
          jobId={jobId}
          applicationId={applicationId}
          candidateName={candidate.name}
          onClose={() => setIsRequestReviewOpen(false)}
        />
      ) : null}

      {isEditModalOpen ? null : (
        <>
          <CandidateHeader
            candidate={candidate}
            stageName={stageName}
            canRequestReview={
              canRequestReview && Boolean(jobId && applicationId)
            }
            onEdit={handleEditCandidate}
            onDelete={handleDeleteCandidate}
            onRequestReview={() => setIsRequestReviewOpen(true)}
          />

          <div className="px-6 -mt-1">
            <CandidateMoveControls
              stages={stages}
              currentStageId={currentStageId}
              moveTargetStageId={moveTargetStageId}
              isMoving={isMoving}
              moveError={moveError}
              onMoveTargetStageChange={onMoveTargetStageChange}
              onMoveCandidate={onMoveCandidate}
            />
          </div>

          <CandidateInfoGrid candidate={candidate} />

          <CandidateTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            candidate={{
              jobId: candidate.jobId ?? candidate.hiringStageId ?? undefined,
              applicationId: candidate.applicationId ?? undefined,
              resume: candidate.resume,
            }}
          />
        </>
      )}
    </section>
  )
}

export default CandidateDetails

