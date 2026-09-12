import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import { Share2 } from 'lucide-react'
import type { SourceAttributionItem } from '../../../../types/apiTypes'

interface SourceAttributionChartProps {
  sources: SourceAttributionItem[]
}

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: '#0077B5', // LinkedIn Blue
  Referral: '#10B981', // Emerald Green
  Website: '#6366F1', // Indigo
  Naukri: '#FF7555', // Orange / Coral
  Other: '#9CA3AF', // Gray
}

const FALLBACK_PALETTE = ['#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

export const SourceAttributionChart: React.FC<SourceAttributionChartProps> = ({
  sources,
}) => {
  const chartData = sources.map((item, idx) => ({
    name: item.source,
    value: item.count,
    percentage: item.percentage,
    color: SOURCE_COLORS[item.source] || FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length],
  }))

  const totalCandidates = sources.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Source Attribution</h2>
          <p className="text-xs text-gray-500 mt-0.5">Where your top applicants come from</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
          <Share2 className="h-4 w-4" />
        </div>
      </div>

      {totalCandidates === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No sourcing attribution data available.
        </div>
      ) : (
        <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
          <div className="relative h-60 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 text-xs">
                          <p className="font-bold text-gray-900">{data.name}</p>
                          <p className="mt-1 text-gray-600">
                            Candidates:{' '}
                            <span className="font-semibold text-gray-900">{data.value}</span>
                          </p>
                          <p className="mt-0.5 font-semibold text-indigo-600">
                            Share: {data.percentage}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`source-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary Inside Donut */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-gray-900">{totalCandidates}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Sourced
              </span>
            </div>
          </div>

          {/* Legend and percentage breakdown */}
          <div className="w-full md:w-1/2 space-y-2.5">
            {chartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-gray-50/70 p-2.5 text-xs transition hover:bg-gray-100/70"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-gray-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-medium">{item.value}</span>
                  <span className="inline-block min-w-[40px] text-right font-bold text-gray-900">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SourceAttributionChart
