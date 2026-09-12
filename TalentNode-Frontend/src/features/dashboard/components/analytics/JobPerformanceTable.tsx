import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, Briefcase } from 'lucide-react'
import type { JobPerformanceMetric } from '../../../../types/apiTypes'

interface JobPerformanceTableProps {
  jobs: JobPerformanceMetric[]
  organizationId: string
}

export const JobPerformanceTable: React.FC<JobPerformanceTableProps> = ({
  jobs,
  organizationId,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Job Pipeline Health</h2>
          <p className="text-xs text-gray-500 mt-0.5">Performance and throughput across active requisitions</p>
        </div>
        <Link
          to={`/organizations/${organizationId}/jobs`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <span>View All Jobs</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">
          No job pipeline data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Position</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Openings</th>
                <th className="px-4 py-3.5 text-center">Applied</th>
                <th className="px-4 py-3.5 text-center">Active</th>
                <th className="px-4 py-3.5 text-center">Hired</th>
                <th className="px-4 py-3.5 text-right pr-6">Days Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {jobs.map((job) => (
                <tr
                  key={job.jobId}
                  className="transition hover:bg-gray-50/60"
                >
                  <td className="py-3.5 pl-6 pr-4 font-semibold text-gray-900">
                    <Link
                      to={`/organizations/${organizationId}/applications?job=${encodeURIComponent(job.jobId)}`}
                      className="hover:text-indigo-600 flex items-center gap-1.5"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{job.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-500">
                    {job.department}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        job.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700'
                          : job.status === 'paused'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-gray-700">
                    {job.openings}
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-gray-900">
                    {job.appliedCount}
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-indigo-600">
                    {job.interviewCount}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                    {job.hiredCount}
                  </td>
                  <td className="px-4 py-3.5 text-right pr-6 text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>{job.daysOpen}d</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default JobPerformanceTable
