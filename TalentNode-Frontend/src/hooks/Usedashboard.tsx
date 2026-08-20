import { useParams } from 'react-router-dom'
import { useAuthStore } from '../app/store/AuthStore'
import { useJobsQuery, useCandidatesQuery } from './useTalentQueries'

export const useDashboard = () => {
    const { organizationId } = useParams()
    const accessToken = useAuthStore((state) => state.accessToken)

    const {
        data: jobs = [],
        isLoading: jobsLoading,
        error: jobsError,
    } = useJobsQuery(organizationId, accessToken)

    const {
        data: candidates = [],
        isLoading: candidatesLoading,
        error: candidatesError,
    } = useCandidatesQuery(organizationId, accessToken)

    const loading = jobsLoading || candidatesLoading
    const error =
        jobsError || candidatesError
            ? 'Could not load dashboard data.'
            : null

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