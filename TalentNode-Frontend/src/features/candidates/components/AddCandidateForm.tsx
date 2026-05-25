import type { FormEvent } from 'react'
import type { Job as OrgJob } from '../../jobs/services/JobSchema'
import type { SourceOption } from '../../../hooks/UseCandidate'

const inputClass =
    'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'

const labelClass = 'block text-sm font-medium text-gray-700'

interface FormFields {
    name: string
    setName: (v: string) => void
    email: string
    setEmail: (v: string) => void
    phone: string
    setPhone: (v: string) => void
    skills: string
    setSkills: (v: string) => void
    experience: string
    setExperience: (v: string) => void
    currentCompany: string
    setCurrentCompany: (v: string) => void
    currentRole: string
    setCurrentRole: (v: string) => void
    tags: string
    setTags: (v: string) => void
    notes: string
    setNotes: (v: string) => void
    source: SourceOption
    setSource: (v: SourceOption) => void
}

interface Props {
    selectedJob: OrgJob | null
    selectedJobId: string
    formFields: FormFields
    formError: string | null
    fieldErrors: { field: string; message: string }[]
    isSubmitting: boolean
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    onClose: () => void
}

export const AddCandidateForm = ({
    selectedJob,
    selectedJobId,
    formFields,
    formError,
    fieldErrors,
    isSubmitting,
    onSubmit,
    onClose,
}: Props) => {
    const {
        name, setName, email, setEmail, phone, setPhone,
        skills, setSkills, experience, setExperience,
        currentCompany, setCurrentCompany, currentRole, setCurrentRole,
        tags, setTags, notes, setNotes, source, setSource,
    } = formFields

    return (
        <section
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            aria-labelledby="add-candidate-heading"
        >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5 sm:px-8">
                <h2
                    id="add-candidate-heading"
                    className="text-lg font-semibold text-gray-900"
                >
                    New candidate
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    They are saved to your org and{' '}
                    <span className="font-medium">
                        assigned to {selectedJob?.title ?? 'the selected job'}
                    </span>
                    .
                </p>
                {!selectedJobId ? (
                    <p className="mt-2 text-sm font-medium text-amber-800">
                        Pick a job above before submitting.
                    </p>
                ) : null}
            </div>

            <form
                onSubmit={onSubmit}
                className="space-y-6 px-6 py-6 sm:px-8 sm:py-8"
            >
                {(formError || fieldErrors.length > 0) && (
                    <div
                        className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900"
                        role="alert"
                    >
                        {formError ? (
                            <p className="font-medium">{formError}</p>
                        ) : null}
                        {fieldErrors.length > 0 ? (
                            <ul className="mt-2 list-inside list-disc space-y-0.5">
                                {fieldErrors.map((e) => (
                                    <li key={`${e.field}-${e.message}`}>
                                        <span className="font-medium">{e.field}</span>: {e.message}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>
                        Name
                        <input
                            required
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            className={inputClass}
                            placeholder="Jane Doe"
                            disabled={!selectedJobId}
                        />
                    </label>
                    <label className={labelClass}>
                        Email
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(ev) => setEmail(ev.target.value)}
                            className={inputClass}
                            placeholder="jane@company.com"
                            disabled={!selectedJobId}
                        />
                    </label>
                    <label className={labelClass}>
                        Phone
                        <input
                            type="tel"
                            value={phone}
                            onChange={(ev) => setPhone(ev.target.value)}
                            className={inputClass}
                            placeholder="+91 …"
                            disabled={!selectedJobId}
                        />
                    </label>
                    <label className={labelClass}>
                        Source
                        <select
                            value={source}
                            onChange={(ev) => setSource(ev.target.value as SourceOption)}
                            className={inputClass}
                            disabled={!selectedJobId}
                        >
                            <option value="">Choose how you found them…</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Referral">Referral</option>
                            <option value="Website">Website</option>
                            <option value="Naukri">Naukri</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>
                    <label className={labelClass}>
                        Current company
                        <input
                            value={currentCompany}
                            onChange={(ev) => setCurrentCompany(ev.target.value)}
                            className={inputClass}
                            placeholder="Acme Inc."
                            disabled={!selectedJobId}
                        />
                    </label>
                    <label className={labelClass}>
                        Current role
                        <input
                            value={currentRole}
                            onChange={(ev) => setCurrentRole(ev.target.value)}
                            className={inputClass}
                            placeholder="Senior engineer"
                            disabled={!selectedJobId}
                        />
                    </label>
                    <label className={labelClass}>
                        Years of experience
                        <input
                            inputMode="decimal"
                            value={experience}
                            onChange={(ev) => setExperience(ev.target.value)}
                            className={inputClass}
                            placeholder="e.g. 5"
                            disabled={!selectedJobId}
                        />
                    </label>
                    <label className={labelClass}>
                        Skills
                        <input
                            value={skills}
                            onChange={(ev) => setSkills(ev.target.value)}
                            className={inputClass}
                            placeholder="React, Node, …"
                            disabled={!selectedJobId}
                        />
                    </label>
                </div>

                <label className={labelClass}>
                    Tags
                    <input
                        value={tags}
                        onChange={(ev) => setTags(ev.target.value)}
                        className={inputClass}
                        placeholder="Labels, comma-separated"
                        disabled={!selectedJobId}
                    />
                </label>

                <label className={labelClass}>
                    Notes
                    <textarea
                        value={notes}
                        onChange={(ev) => setNotes(ev.target.value)}
                        rows={3}
                        className={`${inputClass} resize-y min-h-[88px]`}
                        placeholder="Interview notes…"
                        disabled={!selectedJobId}
                    />
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedJobId}
                        className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[160px]"
                    >
                        {isSubmitting ? 'Saving…' : 'Save candidate'}
                    </button>
                </div>
            </form>
        </section>
    )
}