import { useMemo, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import type { Candidate } from '../../candidates/services/CandidateSchema'
import { deleteCandidate } from '../../candidates/services/CandidateServices'

import CandidateHeader from './CandidateHeader'
import RequestReviewModal from './RequestReviewModal'
import CandidateInfoGrid from './CandidateInfoGrid'
import CandidateMoveControls from './CandidateMoveControls'
import CandidateTabs, { type CandidateDetailTab } from './CandidateTabs'
import EditCandidateModal from './EditCandidateModal'
import ResolveCandidateModal from './ResolveCandidateModal'

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
  onCandidateDeleted?: (candidateId: string) => void
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
  onCandidateDeleted,
}: CandidateDetailsProps) => {
  const role = useAuthStore((s) => s.user?.role)
  const accessToken = useAuthStore((s) => s.accessToken)
  const [activeTab, setActiveTab] = useState<CandidateDetailTab>('notes')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRequestReviewOpen, setIsRequestReviewOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isDeletingCandidate, setIsDeletingCandidate] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const canRequestReview = useMemo(
    () =>
      role === 'admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager',
    [role],
  )
  const canDeleteCandidate = role === 'admin' || role === 'recruiter'

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

  const handleDeleteCandidate = async () => {
    if (!accessToken || isDeletingCandidate) return

    const shouldDelete = window.confirm(
      `Delete ${candidate.name}? This will remove the candidate and their application activity from your organization.`,
    )

    if (!shouldDelete) return

    setIsDeletingCandidate(true)
    setDeleteError(null)

    try {
      await deleteCandidate(candidate._id, accessToken)
      onCandidateDeleted?.(candidate._id)
    } catch (error) {
      setDeleteError(
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Could not delete candidate.',
      )
    } finally {
      setIsDeletingCandidate(false)
    }
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

      {isResolveModalOpen && jobId && applicationId && candidate ? (
        <ResolveCandidateModal
          jobId={jobId}
          applicationId={applicationId}
          candidateName={candidate.name}
          onClose={() => setIsResolveModalOpen(false)}
          onResolved={() => {
            setIsResolveModalOpen(false);
            window.location.reload(); // Quick refresh to clear pipeline
          }}
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
            canDelete={canDeleteCandidate}
            onEdit={handleEditCandidate}
            onDelete={handleDeleteCandidate}
            onRequestReview={() => setIsRequestReviewOpen(true)}
            onResolve={() => setIsResolveModalOpen(true)}
          />

          {deleteError ? (
            <p className="mx-6 mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
              {deleteError}
            </p>
          ) : null}

          {isDeletingCandidate ? (
            <p className="mx-6 mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              Deleting candidate...
            </p>
          ) : null}

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
              jobId: candidate.jobId ?? jobIdFromPage,
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
