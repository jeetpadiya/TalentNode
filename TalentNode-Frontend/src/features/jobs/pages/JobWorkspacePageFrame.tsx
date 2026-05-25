import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuthStore } from '../../../app/store/AuthStore'
import JobSetupHeader from '../components/JobSetupHeader'
import JobWorkspaceTabs from '../components/JobWorkspaceTabs'
import { getJobById } from '../services/JobServices'
import type { Job } from '../services/JobSchema'

type JobWorkspacePageFrameProps = {
  children: (job: Job, setJob: (job: Job) => void) => ReactNode
}

const JobWorkspacePageFrame = ({ children }: JobWorkspacePageFrameProps) => {
  const { organizationId, jobId } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadJob = async () => {
      if (!accessToken || !jobId) {
        setError('Job could not be loaded.')
        setIsLoading(false)
        return
      }

      try {
        const response = await getJobById(jobId, accessToken)
        if (!isMounted) return
        setJob(response)
        setError(null)
      } catch (caughtError) {
        const message =
          typeof caughtError === 'object' &&
          caughtError !== null &&
          'message' in caughtError
            ? String(caughtError.message)
            : 'Could not load job.'

        if (isMounted) setError(message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadJob()

    return () => {
      isMounted = false
    }
  }, [accessToken, jobId])

  const handleAddCandidate = () => {
    if (!organizationId) return

    const params = new URLSearchParams()
    if (jobId) params.set('job', jobId)
    params.set('add', '1')

    navigate(`/organizations/${organizationId}/candidates?${params.toString()}`)
  }

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading job workspace...</p>
  }

  if (error || !job) {
    return <p className="text-sm text-red-600">{error ?? 'Job not found.'}</p>
  }

  return (
    <section className="mx-auto max-w-4xl">
      <JobSetupHeader
        title={job.title}
        canAddCandidate={Boolean(organizationId)}
        onAddCandidate={handleAddCandidate}
      />
      <JobWorkspaceTabs />
      {children(job, setJob)}
    </section>
  )
}

export default JobWorkspacePageFrame
