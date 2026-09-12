import { useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { useJobsQuery } from '../../../hooks/useTalentQueries'

const JobPipeline = () => {
  const labelClass = 'block text-sm font-medium text-gray-700'
  const inputClass =
    'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'

  const formatJobStatus = (s: string) => s.replace(/_/g, ' ')
  const accessToken = useAuthStore((state) => state.accessToken)
  const { organizationId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    data: jobs = [],
    isLoading: jobsLoading,
    error: jobsErrorObj,
  } = useJobsQuery(organizationId, accessToken)

  const selectedJobId = searchParams.get('job')?.trim() ?? ''
  const hasAutoSelectedRef = useRef(false)

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  )

  const setJobSelection = (jobId: string) => {
    hasAutoSelectedRef.current = true
    const next = new URLSearchParams(searchParams)
    if (jobId) next.set('job', jobId)
    else next.delete('job')
    setSearchParams(next, { replace: true })
  }

  // Auto-select first job if none is currently selected in search params
  useEffect(() => {
    if (jobs.length > 0 && !hasAutoSelectedRef.current) {
      const currentJobId = searchParams.get('job')?.trim() ?? ''
      if (!currentJobId || !jobs.some((j) => j.id === currentJobId)) {
        hasAutoSelectedRef.current = true
        const next = new URLSearchParams(searchParams)
        next.set('job', jobs[0].id)
        setSearchParams(next, { replace: true })
      }
    }
  }, [jobs, searchParams, setSearchParams])

  const jobsError = jobsErrorObj
    ? jobsErrorObj instanceof Error
      ? jobsErrorObj.message
      : 'Could not load jobs.'
    : null

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      aria-label="Pick job"
    >
      <label className={labelClass}>
        Job
        <select
          value={selectedJobId}
          onChange={(ev) => setJobSelection(ev.target.value.trim())}
          className={inputClass}
        >
          <option value="">Select a job to view its pipeline…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
              {j.status !== 'draft' ? ` (${formatJobStatus(j.status)})` : ''}
            </option>
          ))}
        </select>
      </label>

      {jobsLoading ? (
        <p className="mt-2 text-xs text-gray-500">Loading jobs…</p>
      ) : jobsError ? (
        <p className="mt-2 text-sm text-red-600">{jobsError}</p>
      ) : null}

      {selectedJob ? (
        <p className="mt-2 text-sm text-gray-600">
          Showing pipeline for <span className="font-semibold">{selectedJob.title}</span>.
        </p>
      ) : null}
    </section>
  )
}

export default JobPipeline