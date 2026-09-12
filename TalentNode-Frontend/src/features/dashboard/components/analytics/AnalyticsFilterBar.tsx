import React from 'react'
import { Filter, Calendar, RotateCw } from 'lucide-react'
import type { AnalyticsRange } from '../../../../types/apiTypes'

type JobOption = {
  id: string
  title: string
}

interface AnalyticsFilterBarProps {
  jobs: JobOption[]
  selectedJobId: string
  onJobChange: (jobId: string) => void
  selectedRange: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  jobs,
  selectedJobId,
  onJobChange,
  selectedRange,
  onRangeChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const rangeOptions: Array<{ value: AnalyticsRange; label: string }> = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Job Selector Dropdown */}
        <div className="relative min-w-[200px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={selectedJobId}
            onChange={(e) => onJobChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-8 text-sm font-medium text-gray-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Jobs & Pipelines</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Selector Pill */}
        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/70 p-1">
          <div className="pl-2 pr-1 text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRangeChange(opt.value)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedRange === opt.value
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  )
}

export default AnalyticsFilterBar
