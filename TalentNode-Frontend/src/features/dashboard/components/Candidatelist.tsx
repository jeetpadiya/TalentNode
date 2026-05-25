import { Link } from 'react-router-dom'
import type { Candidate } from '../../candidates/services/CandidateSchema'

interface Props {
    base: string
    candidates: Candidate[]
}

export const CandidateList = ({ base, candidates }: Props) => (
    <section aria-labelledby="dash-candidates-heading">
        <div className="mb-4 flex items-center justify-between gap-2">
            <div>
                <h2
                    id="dash-candidates-heading"
                    className="text-lg font-semibold text-gray-900"
                >
                    All candidates
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                    Organization roster (not filtered by job).
                </p>
            </div>
            <Link
                to={`${base}/candidates`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                By job
            </Link>
        </div>

        {candidates.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center text-sm text-gray-600">
                No candidates yet.{' '}
                <Link
                    to={`${base}/candidates?add=1`}
                    className="font-medium text-gray-900 underline-offset-4 hover:underline"
                >
                    Add your first
                </Link>
                .
            </p>
        ) : (
            <ul className="space-y-2">
                {candidates.map((c) => (
                    <li
                        key={c._id}
                        className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <Link
                            to={
                                c.jobId && c.applicationId
                                    ? `${base}/applications/${c.applicationId}?job=${encodeURIComponent(c.jobId)}`
                                    : `${base}/candidates`
                            }
                            className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="sr-only">{`View details for ${c.name}`}</span>
                        </Link>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="mt-0.5 truncate text-sm text-gray-600">{c.email}</p>
                        {c.source ? (
                            <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                {c.source}
                            </span>
                        ) : null}
                    </li>
                ))}
            </ul>
        )}
    </section>
)
