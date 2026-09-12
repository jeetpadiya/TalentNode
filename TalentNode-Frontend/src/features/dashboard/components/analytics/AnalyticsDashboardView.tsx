import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useAnalyticsQuery,
  useJobsQuery,
  useInvalidateAnalyticsQueries,
} from '../../../../hooks/useTalentQueries'
import type { AnalyticsRange } from '../../../../types/apiTypes'
import AnalyticsFilterBar from './AnalyticsFilterBar'
import AnalyticsKpiGrid from './AnalyticsKpiGrid'
import PipelineFunnelChart from './PipelineFunnelChart'
import SourceAttributionChart from './SourceAttributionChart'
import ApplicationVolumeChart from './ApplicationVolumeChart'
import JobPerformanceTable from './JobPerformanceTable'

export const AnalyticsDashboardView: React.FC = () => {
  const { organizationId } = useParams()
  const [selectedJobId, setSelectedJobId] = useState<string>('all')
  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>('30d')
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  const { invalidateOverview } = useInvalidateAnalyticsQueries()

  // 1. Fetch Organization Open Jobs for filter bar
  const { data: jobs = [] } = useJobsQuery(organizationId)

  // 2. Fetch Recruiting Analytics based on selected filters
  const {
    data: analytics,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useAnalyticsQuery(organizationId, {
    jobId: selectedJobId === 'all' ? undefined : selectedJobId,
    range: selectedRange,
  })

  const handleRefresh = async () => {
    setIsManualRefreshing(true)
    if (organizationId) {
      await invalidateOverview(organizationId)
    }
    await refetch()
    setIsManualRefreshing(false)
  }

  const selectedJobTitle =
    selectedJobId !== 'all' ? jobs.find((j) => j.id === selectedJobId)?.title : undefined

  if (isLoading && !analytics) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="text-xs font-medium text-gray-500">Calculating recruiting analytics...</p>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-red-800">
          {error instanceof Error ? error.message : 'Could not load analytics.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Filter Controls */}
      <AnalyticsFilterBar
        jobs={jobs}
        selectedJobId={selectedJobId}
        onJobChange={setSelectedJobId}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching || isManualRefreshing}
      />

      {/* 2. Executive KPIs */}
      <AnalyticsKpiGrid kpis={analytics.kpis} />

      {/* 3. Conversion Funnel & Source Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PipelineFunnelChart
          stages={analytics.pipelineFunnel}
          selectedJobTitle={selectedJobTitle}
        />
        <SourceAttributionChart sources={analytics.sourceAttribution} />
      </div>

      {/* 4. Application Velocity & Hires Over Time */}
      <ApplicationVolumeChart trends={analytics.applicationTrends} />

      {/* 5. Requisition Health Matrix */}
      {organizationId && (
        <JobPerformanceTable
          jobs={analytics.jobPerformance}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}

export default AnalyticsDashboardView
