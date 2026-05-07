import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getJobs, type Job } from '../services/JobServices'


const formatLabel = (value: string) => value.replace(/_/g, ' ')

const JobsPage = () => {
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
        <p className="text-sm text-gray-600">Loading jobs...</p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!isLoading && !error && jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No jobs yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Use the Create a Job button in the navbar to start a draft.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() =>
              navigate(`/organizations/${organizationId}/jobs/${job.id}/setup`)
            }
            className="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {job.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {[job.department, job.location].filter(Boolean).join(' / ') ||
                    'Details not added'}
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                {formatLabel(job.status)}
              </span>
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
          </button>
        ))}
      </div>
    </section>
  )
}

export default JobsPage
