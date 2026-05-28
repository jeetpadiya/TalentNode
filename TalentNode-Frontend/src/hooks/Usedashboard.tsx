import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../app/store/AuthStore'
// import { getCandidates } from '..candidates/services/CandidateServices'
import { getCandidates } from '../features/candidates/services/CandidateServices'
import type { Candidate } from '../features/candidates/services/CandidateSchema'
// import { getJobs } from '../../jobs/services/JobServices'
import { getJobs } from '../features/jobs/services/JobServices'
import type { Job } from '../features/jobs/services/JobSchema'

export const useDashboard = () => {
    const { organizationId } = useParams()
    const accessToken = useAuthStore((state) => state.accessToken)

    const [jobs, setJobs] = useState<Job[]>([])
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            if (!accessToken) {
                setError('Sign in to view your dashboard.')
                setLoading(false)
                return
            }
            try {
                const [jobList, candidateList] = await Promise.all([
                    getJobs(accessToken),
                    getCandidates(accessToken),
                ])
                if (!cancelled) {
                    setJobs(jobList)
                    setCandidates(candidateList)
                    setError(null)
                }
            } catch (e) {
                if (!cancelled) {
                    const message =
                        typeof e === 'object' && e !== null && 'message' in e
                            ? String((e as { message?: unknown }).message)
                            : 'Could not load dashboard data.'
                    setError(message)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void load()
        return () => { cancelled = true }
    }, [accessToken])

    const base = organizationId ? `/organizations/${organizationId}` : ''

    return {
        base,
        jobs,
        candidates,
        loading,
        error,
        recentJobs: jobs.slice(0, 3),
        recentCandidates: candidates.slice(0, 3),
    }
}