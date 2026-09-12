import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { ApplicationTrendDataPoint } from '../../../../types/apiTypes'

interface ApplicationVolumeChartProps {
  trends: ApplicationTrendDataPoint[]
}

export const ApplicationVolumeChart: React.FC<ApplicationVolumeChartProps> = ({
  trends,
}) => {
  const totalApps = trends.reduce((sum, item) => sum + item.applications, 0)
  const totalHires = trends.reduce((sum, item) => sum + item.hires, 0)

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Application Velocity & Hires</h2>
          <p className="text-xs text-gray-500 mt-0.5">Daily incoming applications and hiring milestones</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            <span className="text-gray-600">Applications ({totalApps})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Hires ({totalHires})</span>
          </div>
        </div>
      </div>

      {trends.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No historical application trend data for this period.
        </div>
      ) : (
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trends}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const apps = payload.find((p) => p.dataKey === 'applications')?.value ?? 0
                    const hires = payload.find((p) => p.dataKey === 'hires')?.value ?? 0
                    return (
                      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 text-xs">
                        <p className="font-bold text-gray-900 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{label}</span>
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-600 flex justify-between gap-4">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-indigo-600" />
                              Applications:
                            </span>
                            <span className="font-semibold text-gray-900">{apps}</span>
                          </p>
                          <p className="text-gray-600 flex justify-between gap-4">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Hired:
                            </span>
                            <span className="font-semibold text-gray-900">{hires}</span>
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#4F46E5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorApps)"
              />
              <Area
                type="monotone"
                dataKey="hires"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHires)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ApplicationVolumeChart
