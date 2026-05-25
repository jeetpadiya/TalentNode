import {useEffect,useState,useMemo} from 'react'
import type { Job } from '../../jobs/services/JobSchema'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getJobs } from '../../jobs/services/JobServices'


const JobPipeline = ()=>{

  const labelClass = 'block text-sm font-medium text-gray-700'
const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'

  
  const formatJobStatus = (s: string) => s.replace(/_/g, ' ')
  const accessToken = useAuthStore((state) => state.accessToken)


  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError, setJobsError] = useState<string | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()

  
  const selectedJobId = searchParams.get('job')?.trim() ?? ''

    const selectedJob = useMemo(
      () => jobs.find((j) => j.id === selectedJobId) ?? null,
      [jobs, selectedJobId],
    )
     const setJobSelection = (jobId: string) => {
    const next = new URLSearchParams(searchParams)
    if (jobId) next.set('job', jobId)
    else next.delete('job')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    let mounted = true

    void (async () => {
      if (!accessToken) {
        if (!mounted) return
        setJobs([])
        setJobsLoading(false)
        setJobsError('Sign in to view your applications.')
        return
      }

      setJobsLoading(true)
      setJobsError(null)
      try {
        const list = await getJobs(accessToken)
        if (mounted) setJobs(list)
      } catch (e) {
        if (mounted) {
          setJobs([])
          setJobsError(
            typeof e === 'object' && e !== null && 'message' in e
              ? String((e as { message?: unknown }).message)
              : 'Could not load jobs.',
          )
        }
      } finally {
        if (mounted) setJobsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [accessToken])

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