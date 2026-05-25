import type { Job as OrgJob } from '../../jobs/services/JobSchema'
import type { Candidate } from '../services/CandidateServices'
import { CandidateCard } from './CandidateCard'

interface Props {
    candidates: Candidate[]
    listLoading: boolean
    listError: string | null
    selectedJobId: string
    selectedJob: OrgJob | null
}

export const CandidateList = ({
    candidates,
    listLoading,
    listError,
    selectedJobId,
    selectedJob,
}: Props) => (
    <section aria-labelledby="pool-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h2
                    id="pool-heading"
                    className="text-lg font-semibold text-gray-900"
                >
                    {selectedJobId
                        ? `Candidates · ${selectedJob?.title ?? 'this job'}`
                        : 'Candidates'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Only people linked to the selected opening appear here.
                </p>
            </div>
            {!listLoading && selectedJobId && !listError ? (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 tabular-nums">
                    {candidates.length}{' '}
                    {candidates.length === 1 ? 'person' : 'people'}
                </span>
            ) : null}
        </div>

        {!selectedJobId ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-14 text-center text-sm text-gray-600">
                Select a job above to load its candidate list.
            </div>
        ) : listLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-sm text-gray-600">
                <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800"
                    aria-hidden
                />
                Loading candidates…
            </div>
        ) : listError ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                {listError}
            </p>
        ) : candidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-6 py-16 text-center">
                <p className="text-base font-medium text-gray-900">
                    No candidates on this job yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                    Use{' '}
                    <span className="font-medium text-gray-800">Add candidate</span>{' '}
                    — they will be tied to {selectedJob?.title ?? 'this role'} automatically.
                </p>
            </div>
        ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
                {candidates.map((c) => (
                    <CandidateCard
                        key={c._id}
                        candidate={c}
                        selectedJobId={selectedJobId}
                    />
                ))}
            </ul>
        )}
    </section>
)
