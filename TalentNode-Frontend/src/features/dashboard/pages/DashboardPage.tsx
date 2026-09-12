import { useState } from 'react'
import { BarChart3, LayoutGrid } from 'lucide-react'
import { useDashboard } from '../../../hooks/Usedashboard'
import { DashboardStats } from '../components/Dashboardstats'
import { JobList } from '../components/Joblist'
import { CandidateList } from '../components/Candidatelist'
import AnalyticsDashboardView from '../components/analytics/AnalyticsDashboardView'

type DashboardTab = 'analytics' | 'activity'

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('analytics')
  const { base, jobs, candidates, loading, error, recentJobs, recentCandidates } = useDashboard()

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Header with Title and Tab Switcher */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {activeTab === 'analytics'
              ? 'Executive metrics, conversion rates, and pipeline health.'
              : 'Snapshot of open roles and recent candidates in this organization.'}
          </p>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100/80 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Recruiting Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'activity'
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Overview & Activity</span>
          </button>
        </div>
      </header>

      {/* Tab 1: Recruiting Analytics */}
      {activeTab === 'analytics' && <AnalyticsDashboardView />}

      {/* Tab 2: Recent Activity & Simple Roster */}
      {activeTab === 'activity' && (
        <div className="space-y-10">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800"
                aria-hidden
              />
              Loading overview…
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
              <div className="space-y-10">
                <JobList base={base} jobs={recentJobs} />
                <CandidateList base={base} candidates={recentCandidates} />
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default DashboardPage