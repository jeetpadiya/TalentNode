import { Link } from 'react-router-dom'
import type { Job } from '../../jobs/services/JobSchema'
import type { Candidate } from '../../candidates/services/CandidateSchema'

interface Props {
    base: string
    jobs: Job[]
    candidates: Candidate[]
}

export const DashboardStats = ({ base, jobs, candidates }: Props) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Open jobs</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
                {jobs.length}
            </p>
            <Link
                to={`${base}/jobs`}
                className="mt-4 inline-block text-sm font-semibold text-gray-900 underline-offset-4 hover:underline"
            >
                View all jobs
            </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Candidates (organization)</p>
            <p className="mt-1 text-xs text-gray-500">
                Everyone saved in your workspace, every job combined.
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
                {candidates.length}
            </p>
            <Link
                to={`${base}/candidates`}
                className="mt-4 inline-block text-sm font-semibold text-gray-900 underline-offset-4 hover:underline"
            >
                Candidates by job
            </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-gray-500">Quick actions</p>
            <ul className="mt-3 space-y-2 text-sm">
                <li>
                    <Link
                        to={`${base}/candidates?add=1`}
                        className="font-medium text-gray-900 underline-offset-4 hover:underline"
                    >
                        Add a candidate
                    </Link>
                </li>
                <li>
                    <Link
                        to={`${base}/jobs`}
                        className="font-medium text-gray-900 underline-offset-4 hover:underline"
                    >
                        Manage jobs
                    </Link>
                </li>
            </ul>
        </div>
    </div>
)