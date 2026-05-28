import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getJobs, updateJobStatus, type Job } from '../services/JobServices'
import { toast } from '../../../app/ui/toast'
import DensityToggle from '../../../components/common/DensityToggle'
import { useDensity } from '../../../components/common/useDensity'



const formatLabel = (value: string) => value.replace(/_/g, ' ')


const formatDepartment = (raw: string | null | undefined) => {
  if (!raw) return ''
  // backend may store "{id}|{name}" for job category
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
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadJobs = async () => {
      if (!accessToken) {
        setError('You need to login first.')
        setIsLoading(false)
        return
      }

      try {
        const response = await getJobs(accessToken)

        if (isMounted) {
          setJobs(response)
          setError(null)
        }
      } catch (caughtError) {
        const message =
          typeof caughtError === 'object' &&
          caughtError !== null &&
          'message' in caughtError
            ? String(caughtError.message)
            : 'Could not load jobs.'

        if (isMounted) {
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadJobs()

    return () => {
      isMounted = false
    }
  }, [accessToken])

  const handleToggleStatus = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation()
    e.preventDefault()

    if (!accessToken) return

    const newStatus = job.status === 'open' ? 'paused' : 'open'
    
    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)),
    )

    try {
      await updateJobStatus(job.id, newStatus, accessToken)
      toast.success(`Job ${newStatus === 'open' ? 'opened' : 'paused'}`)
    } catch (err) {
      // Revert on error
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j)),
      )
      console.error('Failed to update job status:', err)
      setError('Failed to update job status. Please try again.')
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
        <div className="card border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No jobs yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use the Create a Job button in the navbar to start a draft.
          </p>
        </div>
      ) : null}

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
    </section>
  )
}

export default JobsPage
