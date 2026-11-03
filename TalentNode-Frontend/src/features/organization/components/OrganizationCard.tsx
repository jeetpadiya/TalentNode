import { Briefcase, Users, UserCheck, ChevronRight, Building2 } from 'lucide-react'
import type { Organization } from '../services/organizationSchemas'

type OrganizationCardProps = {
  organization: Organization
  onClick: (organizationId: string) => void | Promise<void>
}

const OrganizationCard = ({ organization, onClick }: OrganizationCardProps) => {
  const initial = organization.name?.trim().charAt(0).toUpperCase() || 'O'

  return (
    <button
      type="button"
      onClick={() => onClick(organization.id)}
      className="group flex w-full flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 text-left shadow-xs transition-all hover:border-indigo-300 hover:bg-slate-50/60 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left side: Org Avatar & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        {organization.logoUrl ? (
          <img
            src={organization.logoUrl}
            alt={organization.name}
            className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 object-cover shadow-xs"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-lg font-bold text-white shadow-sm shadow-indigo-500/20">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {organization.name}
            </h3>
            {organization.slug ? (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                {organization.slug}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
            {organization.description || (
              <span className="inline-flex items-center gap-1 text-gray-400">
                <Building2 className="h-3 w-3" /> TalentNode Workspace
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Right side: Stats & Action Arrow */}
      <div className="flex items-center justify-between gap-3 shrink-0 sm:justify-end">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Total Jobs */}
          <div
            className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-1.5 transition-colors group-hover:bg-blue-50"
            title="Total jobs in organization"
          >
            <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-gray-900">
                {organization.totalJobs ?? 0}
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                Jobs
              </span>
            </div>
          </div>

          {/* Total Candidates */}
          <div
            className="flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 transition-colors group-hover:bg-emerald-50"
            title="Total candidates in organization"
          >
            <Users className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-gray-900">
                {organization.totalCandidates ?? 0}
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                Candidates
              </span>
            </div>
          </div>

          {/* Members */}
          <div
            className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 transition-colors group-hover:bg-indigo-50"
            title="Total members in organization"
          >
            <UserCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-gray-900">
                {organization.totalMembers ?? 0}
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                Members
              </span>
            </div>
          </div>
        </div>

        {/* Chevron Icon */}
        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600 hidden sm:block" />
      </div>
    </button>
  )
}

export default OrganizationCard
