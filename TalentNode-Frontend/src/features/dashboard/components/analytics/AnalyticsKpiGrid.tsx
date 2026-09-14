import React from 'react'
import { FileText, CheckCircle2, Clock, Briefcase, TrendingUp } from 'lucide-react'
import type { AnalyticsKpiMetrics } from '../../../../types/apiTypes'

interface AnalyticsKpiGridProps {
  kpis: AnalyticsKpiMetrics
}

export const AnalyticsKpiGrid: React.FC<AnalyticsKpiGridProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Applications',
      value: kpis.totalApplications.toLocaleString(),
      subtitle: `${kpis.activeCount} active in pipeline`,
      badge: `${kpis.totalCandidates} pool`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Hired Candidates',
      value: kpis.hiredCount.toLocaleString(),
      subtitle: `From ${kpis.totalApplications} total applicants`,
      badge: `${kpis.offerRate}% offer`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Time to Hire',
      value: `${kpis.avgTimeToHireDays} days`,
      subtitle: 'From apply to hire decision',
      badge: kpis.avgTimeToHireDays <= 25 ? 'Fast' : 'Standard',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      icon: Clock,
      iconColor: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Active Openings',
      value: kpis.totalActiveJobs.toLocaleString(),
      subtitle: `${kpis.rejectedCount} candidates resolved`,
      badge: `${kpis.rejectionRate}% rejected`,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: Briefcase,
      iconColor: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex min-h-[40px] items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 leading-snug">
                {card.title}
              </span>
              <div className={`shrink-0 rounded-xl p-2.5 ${card.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                {card.value}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
              <span className="min-w-0 truncate text-gray-500" title={card.subtitle}>
                {card.subtitle}
              </span>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${card.badgeColor}`}
              >
                <TrendingUp className="h-3 w-3 shrink-0" />
                {card.badge}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnalyticsKpiGrid
