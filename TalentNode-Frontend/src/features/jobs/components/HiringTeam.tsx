import type { Job } from '../services/JobSchema'

type HiringTeamProps = {
  job: Job
}

export const HiringTeam = ({ job }: HiringTeamProps) => {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Hiring team</h2>
      <p className="mt-1 text-sm text-gray-600">
        Add recruiters, hiring managers, and interviewers for {job.title}.
      </p>

      <div className="mt-6 rounded-md border border-dashed border-gray-300 p-5 text-sm text-gray-600">
        Team assignment is ready for the next backend model. For now, this
        section marks where role-based hiring members will be managed.
      </div>
    </section>
  )
}
