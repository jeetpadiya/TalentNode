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
                    Recent candidates
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                    Showing 3 most recent candidates.
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
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-6 py-12 text-center">
                <p className="text-base font-medium text-gray-900">No candidates yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                    Add your first candidate to start building your shortlist.
                </p>
                <Link
                    to={`${base}/candidates?add=1`}
                    className="mt-5 inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                >
                    Add candidate
                </Link>
            </div>
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
