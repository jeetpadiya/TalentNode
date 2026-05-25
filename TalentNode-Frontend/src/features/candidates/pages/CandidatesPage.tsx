import { Link } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa'
import { useCandidates } from '../../../hooks/UseCandidate'
import { JobSelector } from '../components/JobSelector'
import { AddCandidateForm } from '../components/AddCandidateForm'
import { CandidateList } from '../components/CandidateList'

const CandidatesPage = () => {
    const {
        dashboardHref,
        selectedJobId,
        selectedJob,
        jobs,
        jobsLoading,
        showAddPanel,
        openAddPanel,
        closeAddPanel,
        candidates,
        listLoading,
        listError,
        formError,
        fieldErrors,
        isSubmitting,
        saveSucceeded,
        setJobSelection,
        handleSubmit,
        formFields,
    } = useCandidates()

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-16">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Candidates by job
                    </h1>
                    <p className="max-w-2xl text-gray-600">
                        Choose an open role to see everyone linked to it. For
                        the full organization roster,{' '}
                        <Link
                            to={dashboardHref}
                            className="font-medium text-gray-900 underline-offset-4 hover:underline"
                        >
                            open the dashboard
                        </Link>
                        .
                    </p>
                    {selectedJob ? (
                        <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-blue-950">
                            <span
                                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200/80 text-xs font-bold text-blue-900"
                                aria-hidden
                            >
                                ·
                            </span>
                            <p className="leading-snug">
                                Showing pipeline for{' '}
                                <span className="font-semibold">{selectedJob.title}</span>
                                . New saves from this page are attached to this job automatically.
                            </p>
                        </div>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={showAddPanel ? closeAddPanel : openAddPanel}
                    disabled={!selectedJobId}
                    title={!selectedJobId ? 'Select a job first' : 'Add candidate to this job'}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-45 sm:self-start"
                    aria-expanded={showAddPanel}
                >
                    <FaPlus className="h-4 w-4" aria-hidden />
                    {showAddPanel ? 'Close form' : 'Add candidate'}
                </button>
            </header>

            <JobSelector
                jobs={jobs}
                jobsLoading={jobsLoading}
                selectedJobId={selectedJobId}
                onChange={setJobSelection}
            />

            {saveSucceeded ? (
                <p
                    className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                    role="status"
                >
                    Candidate saved and linked to {selectedJob?.title ?? 'this job'}.
                </p>
            ) : null}

            {showAddPanel ? (
                <AddCandidateForm
                    selectedJob={selectedJob}
                    selectedJobId={selectedJobId}
                    formFields={formFields}
                    formError={formError}
                    fieldErrors={fieldErrors}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onClose={closeAddPanel}
                />
            ) : null}

            <CandidateList
                candidates={candidates}
                listLoading={listLoading}
                listError={listError}
                selectedJobId={selectedJobId}
                selectedJob={selectedJob}
            />
        </div>
    )
}

export default CandidatesPage