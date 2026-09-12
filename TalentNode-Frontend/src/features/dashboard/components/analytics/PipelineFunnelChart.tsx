import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import { Filter } from 'lucide-react'
import type { PipelineFunnelStage } from '../../../../types/apiTypes'

interface PipelineFunnelChartProps {
  stages: PipelineFunnelStage[]
  selectedJobTitle?: string
}

// Visual color palette matching the stage progression from entry to hire
const STAGE_COLORS = [
  '#4F46E5', // Indigo (Applied)
  '#3B82F6', // Blue (Screening)
  '#06B6D4', // Cyan (Assessment)
  '#10B981', // Emerald (Interview)
  '#059669', // Dark Emerald (Offer / Hired)
]

export const PipelineFunnelChart: React.FC<PipelineFunnelChartProps> = ({
  stages,
  selectedJobTitle,
}) => {
  const chartData = stages.map((stage, idx) => ({
    name: stage.name,
    count: stage.count,
    rate: stage.conversionRate,
    color: STAGE_COLORS[idx % STAGE_COLORS.length],
  }))

  const totalAtTop = stages[0]?.count || 0

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>Pipeline Conversion Funnel</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedJobTitle
              ? `Stage pass-through rates for ${selectedJobTitle}`
              : 'Candidate volume progression across hiring stages'}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Filter className="h-3 w-3" />
          <span>{totalAtTop} Total in Pipeline</span>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No pipeline stage data recorded for this selection.
        </div>
      ) : (
        <div className="mt-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 text-xs">
                          <p className="font-bold text-gray-900">{data.name}</p>
                          <p className="mt-1 text-gray-600">
                            Active Candidates:{' '}
                            <span className="font-semibold text-gray-900">{data.count}</span>
                          </p>
                          <p className="mt-0.5 text-indigo-600 font-semibold">
                            Conversion Rate: {data.rate}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion breakdown cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-gray-100">
            {stages.map((stage, idx) => (
              <div
                key={stage.stageId || stage.name}
                className="rounded-xl bg-gray-50/70 p-2.5 text-center transition hover:bg-gray-100/70"
              >
                <div className="text-[11px] font-medium text-gray-500 truncate">
                  {stage.name}
                </div>
                <div className="text-base font-bold text-gray-900 mt-0.5">
                  {stage.count}
                </div>
                <div className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                  {idx === 0 ? 'Entry' : `${stage.conversionRate}% retained`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PipelineFunnelChart
