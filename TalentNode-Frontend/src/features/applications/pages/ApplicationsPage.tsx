import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { FaSearch } from 'react-icons/fa'

import { useAuthStore } from '../../../app/store/AuthStore'
import type { ApplicationStage } from '../services/ApplicationServices'
import {
  getApplicationsByHiringStages,
  moveApplicationToHiringStage,
} from '../services/ApplicationServices'
import type { Candidate } from '../../candidates/services/CandidateSchema'
import JobPipeline from '../components/JobPipeline'
import CandidateList from '../components/CandidateList'
import CandidateDetails from '../components/CandidateDetails'




const ApplicationsPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const { organizationId, applicationId } = useParams()
  const [searchParams] = useSearchParams()

  const selectedJobId = searchParams.get('job')?.trim() ?? ''


  const [stages, setStages] = useState<ApplicationStage[]>([])
  const [stagesLoading, setStagesLoading] = useState(false)
  const [stagesError, setStagesError] = useState<string | null>(null)

  const [activeStageId, setActiveStageId] = useState<string>('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [moveTargetStageId, setMoveTargetStageId] = useState('')
  const [isMovingCandidate, setIsMovingCandidate] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)



  useEffect(() => {
    if (!accessToken || !selectedJobId) {
      setStages([])
      setStagesError(null)
      setActiveStageId('')
      setSelectedCandidateId('')
      return
    }

    setStagesLoading(true)
    setStagesError(null)
    void (async () => {
      try {
        const data = await getApplicationsByHiringStages(selectedJobId, accessToken)
        setStages(data)
      } catch (e) {
        const message =
          typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Could not load applications.'
        setStages([])
        setStagesError(message)
      } finally {
        setStagesLoading(false)
      }
    })()
  }, [accessToken, selectedJobId])

  useEffect(() => {
    if (stages.length === 0) return
    if (stages.some((s) => s.id === activeStageId)) return
    setActiveStageId(stages[0]?.id ?? '')
  }, [stages, activeStageId])

  const activeStage = useMemo(
    () => stages.find((s) => s.id === activeStageId) ?? null,
    [stages, activeStageId],
  )

  useEffect(() => {
    if (!applicationId || stages.length === 0) return

    const stageWithApplication = stages.find((stage) =>
      stage.candidates?.some(
        (candidate) =>
          candidate.applicationId === applicationId || candidate._id === applicationId,
      ),
    )

    if (!stageWithApplication) return

    const candidate = stageWithApplication.candidates?.find(
      (item) => item.applicationId === applicationId || item._id === applicationId,
    )
    setSelectedCandidateId(candidate?._id ?? '')

    if (stageWithApplication.id !== activeStageId) {
      setActiveStageId(stageWithApplication.id)
    }
  }, [activeStageId, applicationId, stages])

  const selectedCandidate = useMemo(
    () =>
      activeStage?.candidates?.find((candidate) => candidate._id === selectedCandidateId) ??
      activeStage?.candidates?.[0] ??
      null,
    [activeStage, selectedCandidateId],
  )

  useEffect(() => {
    setMoveTargetStageId('')
    setMoveError(null)
  }, [selectedCandidate?._id, activeStageId])

  useEffect(() => {
    if (applicationId) return

    const firstCandidateId = activeStage?.candidates?.[0]?._id ?? ''
    if (!activeStage || activeStage.candidates.length === 0) {
      setSelectedCandidateId('')
      return
    }
    if (activeStage.candidates.some((candidate) => candidate._id === selectedCandidateId)) {
      return
    }
    setSelectedCandidateId(firstCandidateId)
  }, [activeStage, applicationId, selectedCandidateId])

  const totalCandidates = useMemo(
    () => stages.reduce((sum, s) => sum + (s.candidates?.length ?? 0), 0),
    [stages],
  )

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidateId(candidate._id)
    if (!organizationId) return

    navigate({
      pathname: `/organizations/${organizationId}/applications/${candidate.applicationId ?? candidate._id}`,
      search: searchParams.toString(),
    })
  }

  const handleStageSelect = (stageId: string) => {
    setActiveStageId(stageId)
    setSelectedCandidateId('')

    if (!organizationId) return

    navigate({
      pathname: `/organizations/${organizationId}/applications`,
      search: searchParams.toString(),
    })
  }

  const handleMoveCandidate = async () => {
    if (
      !accessToken ||
      !selectedJobId ||
      !selectedCandidate?.applicationId ||
      !moveTargetStageId
    ) {
      return
    }

    setIsMovingCandidate(true)
    setMoveError(null)

    try {
      await moveApplicationToHiringStage(
        selectedJobId,
        selectedCandidate.applicationId,
        moveTargetStageId,
        accessToken,
      )

      const nextStages = await getApplicationsByHiringStages(selectedJobId, accessToken)
      setStages(nextStages)
      setActiveStageId(moveTargetStageId)
      setSelectedCandidateId(selectedCandidate._id)
      setMoveTargetStageId('')
    } catch (error) {
      setMoveError(
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Could not move application.',
      )
    } finally {
      setIsMovingCandidate(false)
    }
  }

  const handleCandidateDeleted = (candidateId: string) => {
    setStages((currentStages) =>
      currentStages.map((stage) => ({
        ...stage,
        candidates: stage.candidates.filter(
          (candidate) => candidate._id !== candidateId,
        ),
      })),
    )
    setSelectedCandidateId('')
    setMoveTargetStageId('')
    setMoveError(null)

    if (!organizationId) return

    navigate({
      pathname: `/organizations/${organizationId}/applications`,
      search: searchParams.toString(),
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Applications
        </h1>
        <p className="max-w-2xl text-gray-600">
          Follow submitted applications through each hiring stage.
        </p>
      </header>

      <JobPipeline />



      {!selectedJobId ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-14 text-center text-sm text-gray-600">
          Pick a job to show its hiring stages and applications.
        </div>
      ) : stagesLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/40 px-6 py-16 text-sm text-gray-600">
          <FaSearch className="h-4 w-4" aria-hidden />
          Loading applications…
        </div>
      ) : stagesError ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {stagesError}
        </p>
      ) : (
        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Hiring stages
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {totalCandidates} candidates across {stages.length} stages.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => {
                  const isActive = stage.id === activeStageId

                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleStageSelect(stage.id)}
                      className={[
                        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                      ].join(' ')}
                    >
                      {stage.name}
                      <span className="ml-2 rounded-full bg-white/15 px-1.5 py-0.5 text-xs">
                        {stage.candidates?.length ?? 0}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-6 lg:flex-row">
            <CandidateList
              activeStage={activeStage}
              selectedCandidateId={selectedCandidate?._id ?? ''}
              onCandidateSelect={handleCandidateSelect}
            />

            <CandidateDetails
              candidate={selectedCandidate}
              jobId={selectedJobId}
              stageName={activeStage?.name}
              stages={stages.map((stage) => ({
                id: stage.id,
                name: stage.name,
              }))}
              currentStageId={activeStage?.id}
              moveTargetStageId={moveTargetStageId}
              isMoving={isMovingCandidate}
              moveError={moveError}
              onMoveTargetStageChange={setMoveTargetStageId}
              onMoveCandidate={handleMoveCandidate}
              onCandidateDeleted={handleCandidateDeleted}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
