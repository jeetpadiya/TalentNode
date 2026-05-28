import { Link } from 'react-router-dom'
import type { Job } from '../../jobs/services/JobSchema'

const formatJobStatus = (s: string) => s.replace(/_/g, ' ')

const formatDepartment = (raw: string | null | undefined) => {
    if (!raw) return ''
    // backend may store "{categoryId}|{categoryName}" for job category
    if (raw.includes('|')) {
        const parts = raw.split('|')
        const name = parts.slice(1).join('|').trim()
        return name || raw
    }
    return raw
}


interface Props {
    base: string
    jobs: Job[]
}

export const JobList = ({ base, jobs }: Props) => (
    <section aria-labelledby="dash-jobs-heading">
        <div className="mb-4 flex items-center justify-between gap-2">
            <h2
                id="dash-jobs-heading"
                className="text-lg font-semibold text-gray-900"
            >
                Recent jobs
            </h2>
            <Link
                to={`${base}/jobs`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                See all
            </Link>
        </div>

        {jobs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center text-sm text-gray-600">
                No jobs yet.
                <span className="block text-sm text-gray-600">
                  Create your first job and start managing candidates.
                </span>

            </p>
        ) : (
            <ul className="space-y-2">
                {jobs.map((job) => (
                    <li key={job.id}>
                        <Link
                            to={`${base}/jobs/${job.id}/setup`}
                            className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50/80"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="font-medium text-gray-900">{job.title}</p>
                                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                                    {formatJobStatus(job.status)}
                                </span> 
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {[formatDepartment(job.department), job.location]
                                    .filter(Boolean)
                                    .join(' · ') || 'Details in setup'}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </section>
)