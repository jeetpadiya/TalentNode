import type { Job as OrgJob } from '../../jobs/services/JobSchema'

const inputClass =
    'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'

const labelClass = 'block text-sm font-medium text-gray-700'

interface Props {
    jobs: OrgJob[]
    jobsLoading: boolean
    selectedJobId: string
    onChange: (jobId: string) => void
}

export const JobSelector = ({ jobs, jobsLoading, selectedJobId, onChange }: Props) => (
    <section
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        aria-label="Pick job"
    >
        <label className={labelClass}>
            Job
            <select
                value={selectedJobId}
                onChange={(ev) => onChange(ev.target.value.trim())}
                className={inputClass}
            >
                <option value="">Select a job to load its candidates…</option>
                {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                        {j.title}
                        {j.status !== 'draft' ? ` (${j.status.replace(/_/g, ' ')})` : ''}
                    </option>
                ))}
            </select>
        </label>
        {jobsLoading ? (
            <p className="mt-2 text-xs text-gray-500">Loading jobs…</p>
        ) : jobs.length === 0 ? (
            <p className="mt-2 text-sm text-amber-800">
                No jobs in this workspace yet—create one before you can manage candidates here.
            </p>
        ) : null}
    </section>
)