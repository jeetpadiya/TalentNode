import { useEffect, useMemo, useState } from 'react'

import type { PublicJob } from '../services/publicPortalApi'
import { getPublicJobsByOrgSlug } from '../services/publicPortalApi'

import PublicJobCard from './PublicJobCard'

type Props = {
  orgSlug: string
  currentJobId?: string
  maxJobs?: number
}

export default function PublicJobsBoardPreview({
  orgSlug,
  currentJobId,
  maxJobs = 4,
}: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<PublicJob[]>([])

  useEffect(() => {
    let isMounted = true

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await getPublicJobsByOrgSlug(orgSlug)
        if (!isMounted) return
        setJobs(res.jobs)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'Failed to load job board')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (orgSlug) run()

    return () => {
      isMounted = false
    }
  }, [orgSlug])

  const previewJobs = useMemo(() => {
    const filtered = currentJobId
      ? jobs.filter((j) => String(j.id) !== String(currentJobId))
      : jobs

    return filtered.slice(0, maxJobs)
  }, [jobs, currentJobId, maxJobs])

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">Loading more roles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    )
  }

  if (!previewJobs.length) {
    return null
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm mt-8">
      <h2 className="text-xl font-bold text-gray-900">
        More open roles
      </h2>
      <p className="mt-2 text-sm text-gray-600 mb-6">
        Explore other published positions at this organization.
      </p>

      <div className="grid gap-4 grid-cols-1">
        {previewJobs.map((job) => (
          <PublicJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}

