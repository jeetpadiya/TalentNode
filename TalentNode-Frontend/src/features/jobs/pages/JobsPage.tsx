import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { updateJobStatus, type Job } from '../services/JobServices'
import { toast } from '../../../app/ui/toast'
import DensityToggle from '../../../components/common/DensityToggle'
import { useDensity } from '../../../components/common/useDensity'
import { useJobsQuery, useInvalidateTalentQueries } from '../../../hooks/useTalentQueries'

import { Plus } from 'lucide-react'
import JobPopUp from '../components/JobPopUp'

const formatLabel = (value: string) => value.replace(/_/g, ' ')

const formatDepartment = (raw: string | null | undefined) => {
  if (!raw) return ''
  if (raw.includes('|')) {
    const parts = raw.split('|')
    const name = parts.slice(1).join('|').trim()
    return name || raw
  }
  return raw
}

const JobsPage = () => {
  const [density] = useDensity('jobs')
  const { organizationId } = useParams()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const { invalidateJobs } = useInvalidateTalentQueries()
  const [isJobPopUpOpen, setIsJobPopUpOpen] = useState(false)

  const canCreateJobs = user?.role === 'admin' || user?.role === 'recruiter'

  const {
    data: fetchedJobs = [],
    isLoading,
    error: queryError,
  } = useJobsQuery(organizationId, accessToken)

  const [localStatusOverrides, setLocalStatusOverrides] = useState<Record<string, 'open' | 'paused'>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const jobs = useMemo(() => {
    return fetchedJobs.map((j) => {
      const override = localStatusOverrides[j.id]
      return override ? { ...j, status: override } : j
    })
  }, [fetchedJobs, localStatusOverrides])

  const error = queryError ? 'Could not load jobs.' : actionError

  const handleToggleStatus = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation()
    e.preventDefault()

    if (!accessToken) return

    const newStatus = job.status === 'open' ? 'paused' : 'open'

    // Optimistic override
    setLocalStatusOverrides((prev) => ({ ...prev, [job.id]: newStatus }))

    try {
      await updateJobStatus(job.id, newStatus, accessToken)
      toast.success(`Job ${newStatus === 'open' ? 'opened' : 'paused'}`)
      void invalidateJobs(organizationId)
    } catch (err) {
      setLocalStatusOverrides((prev) => {
        const copy = { ...prev }
        delete copy[job.id]
        return copy
      })
      console.error('Failed to update job status:', err)
      setActionError('Failed to update job status. Please try again.')
      toast.error('Failed to update job status')
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-2 text-gray-600">
            Manage job openings and hiring requirements.
          </p>
        </div>
        {canCreateJobs ? (
          <button
            type="button"
            onClick={() => setIsJobPopUpOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Create a Job
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="card p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" aria-hidden />
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" aria-hidden />
            </div>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-5 w-60 animate-pulse rounded bg-gray-200" aria-hidden />
                    <div className="h-4 w-96 animate-pulse rounded bg-gray-200" aria-hidden />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" aria-hidden />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" aria-hidden />
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" aria-hidden />
                  <div className="h-5 w-28 animate-pulse rounded bg-gray-200" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}



      {error ? (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && jobs.length === 0 ? (
        <div className="card border-dashed p-8 text-center flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-900">No jobs yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your first job opening to start receiving and reviewing candidates.
          </p>
          {canCreateJobs ? (
            <button
              type="button"
              onClick={() => setIsJobPopUpOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create a Job
            </button>
          ) : null}
        </div>
      ) : null}

      {jobs.length > 0 ? (
        <>
          <div className="mt-4 flex items-start justify-between gap-3">
            <DensityToggle densityKey="jobs" />
          </div>
          <div className="mt-4 grid gap-4">
            {jobs.map((job) => (
              <article
                key={job.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(`/organizations/${organizationId}/jobs/${job.id}/setup`)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/organizations/${organizationId}/jobs/${job.id}/setup`)
                  }
                }}
                className={`card text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 ${density === 'compact' ? 'p-3' : 'p-5'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {[formatDepartment(job.department), job.location]
                        .filter(Boolean)
                        .join(' / ') ||
                        'Details not added'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                      {formatLabel(job.status)}
                    </span>
                    
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, job)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                        job.status === 'open' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={job.status === 'open'}
                      title={`Toggle to ${job.status === 'open' ? 'pause' : 'open'}`}
                    >
                      <span className="sr-only">Toggle job active status</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          job.status === 'open' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium capitalize text-gray-600">
                  <span className="rounded-md bg-gray-100 px-2 py-1">
                    {formatLabel(job.employmentType)}
                  </span>
                  <span className="rounded-md bg-gray-100 px-2 py-1">
                    {job.workMode}
                  </span>
                  <span className="rounded-md bg-gray-100 px-2 py-1">
                    {job.experienceLevel}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      <JobPopUp
        isOpen={isJobPopUpOpen}
        onClose={() => setIsJobPopUpOpen(false)}
      />
    </section>
  )
}

export default JobsPage
