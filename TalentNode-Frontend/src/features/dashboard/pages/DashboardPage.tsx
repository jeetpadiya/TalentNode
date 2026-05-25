import { useDashboard } from '../../../hooks/Usedashboard'
import { DashboardStats } from '../components/Dashboardstats'
import { JobList } from '../components/Joblist'
import { CandidateList } from '../components/Candidatelist'

const DashboardPage = () => {
    const { base, jobs, candidates, loading, error, recentJobs, recentCandidates } = useDashboard()

    return (
        <div className="mx-auto max-w-6xl space-y-10 pb-16">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Dashboard
                </h1>
                <p className="mt-2 max-w-2xl text-gray-600">
                    Snapshot of open roles and people in your talent pool for this organization.
                </p>
            </header>

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span
                        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800"
                        aria-hidden
                    />
                    Loading dashboard…
                </div>
            ) : null}

            {error ? (
                <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </p>
            ) : null}

            {!loading && !error ? (
                <>
                    <DashboardStats base={base} jobs={jobs} candidates={candidates} />
                    <div className="grid gap-10 lg:grid-cols-2">
                        <JobList base={base} jobs={recentJobs} />
                        <CandidateList base={base} candidates={recentCandidates} />
                    </div>
                </>
            ) : null}
        </div>
    )
}

export default DashboardPage