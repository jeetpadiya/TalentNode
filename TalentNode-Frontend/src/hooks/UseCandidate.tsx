import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../app/store/AuthStore'
import { getJobs } from '../features/jobs/services/JobServices'
import type {Job as OrgJob} from '../features/jobs/services/JobSchema'

import {
    createCandidate,
    getCandidatesForJob,
    type Candidate,
} from '../features/candidates/services/CandidateServices'

export const SOURCE_OPTIONS = [
    '',
    'LinkedIn',
    'Referral',
    'Website',
    'Naukri',
    'Other',
] as const

export type SourceOption = (typeof SOURCE_OPTIONS)[number]

export const useCandidates = () => {
    const { organizationId } = useParams()
    const accessToken = useAuthStore((state) => state.accessToken)
    const [searchParams, setSearchParams] = useSearchParams()

    const dashboardHref = organizationId
        ? `/organizations/${organizationId}/dashboard`
        : '/dashboard'

    const selectedJobId =
        searchParams.get('job')?.trim() ||
        searchParams.get('fromJob')?.trim() ||
        ''

    const [jobs, setJobs] = useState<OrgJob[]>([])
    const [jobsLoading, setJobsLoading] = useState(true)

    const [showAddPanel, setShowAddPanel] = useState(false)

    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [listLoading, setListLoading] = useState(false)
    const [listError, setListError] = useState<string | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<
        { field: string; message: string }[]
    >([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [saveSucceeded, setSaveSucceeded] = useState(false)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [skills, setSkills] = useState('')
    const [experience, setExperience] = useState('')
    const [currentCompany, setCurrentCompany] = useState('')
    const [currentRole, setCurrentRole] = useState('')
    const [tags, setTags] = useState('')
    const [notes, setNotes] = useState('')
    const [source, setSource] = useState<SourceOption>('')

    const selectedJob = useMemo(
        () => jobs.find((j) => j.id === selectedJobId) ?? null,
        [jobs, selectedJobId],
    )

    useEffect(() => {
        if (searchParams.get('add') !== '1') return
        setShowAddPanel(true)
        const next = new URLSearchParams(searchParams)
        next.delete('add')
        setSearchParams(next, { replace: true })
    }, [searchParams, setSearchParams])

    useEffect(() => {
        let mounted = true
        void (async () => {
            if (!accessToken) {
                setJobsLoading(false)
                return
            }
            try {
                const list = await getJobs(accessToken)
                if (mounted) setJobs(list)
            } catch {
                if (mounted) setJobs([])
            } finally {
                if (mounted) setJobsLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [accessToken])

    const loadJobCandidates = async () => {
        if (!accessToken || !selectedJobId) {
            setCandidates([])
            setListError(null)
            setListLoading(false)
            return
        }
        setListLoading(true)
        setListError(null)
        try {
            const list = await getCandidatesForJob(selectedJobId, accessToken)
            setCandidates(list)
        } catch (caughtError) {
            const message =
                typeof caughtError === 'object' &&
                caughtError !== null &&
                'message' in caughtError
                    ? String((caughtError as { message?: unknown }).message ?? 'Could not load candidates.')
                    : 'Could not load candidates.'
            setListError(message)
            setCandidates([])
        } finally {
            setListLoading(false)
        }
    }

    useEffect(() => {
        void loadJobCandidates()
    }, [accessToken, selectedJobId])

    const setJobSelection = (jobId: string) => {
        const next = new URLSearchParams(searchParams)
        if (jobId) {
            next.set('job', jobId)
            next.delete('fromJob')
        } else {
            next.delete('job')
            next.delete('fromJob')
        }
        setSearchParams(next, { replace: true })
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError(null)
        setFieldErrors([])
        setSaveSucceeded(false)

        if (!accessToken) {
            setFormError('You need to login first.')
            return
        }
        if (!selectedJobId) {
            setFormError('Select a job first so new candidates are tied to this role.')
            return
        }

        setIsSubmitting(true)
        try {
            await createCandidate(
                { name, email, phone, skills, experience, currentCompany, currentRole, tags, notes, source },
                accessToken,
                { jobId: selectedJobId },
            )
            setName('')
            setEmail('')
            setPhone('')
            setSkills('')
            setExperience('')
            setCurrentCompany('')
            setCurrentRole('')
            setTags('')
            setNotes('')
            setSource('')
            setSaveSucceeded(true)
            setShowAddPanel(false)
            await loadJobCandidates()
        } catch (caughtError) {
            if (
                typeof caughtError === 'object' &&
                caughtError !== null &&
                'errors' in caughtError &&
                Array.isArray((caughtError as { errors: unknown }).errors)
            ) {
                setFieldErrors(
                    (caughtError as { errors: { field: string; message: string }[] }).errors,
                )
            }
            const message =
                typeof caughtError === 'object' &&
                caughtError !== null &&
                'message' in caughtError
                    ? String((caughtError as { message?: unknown }).message)
                    : 'Could not create candidate.'
            setFormError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const openAddPanel = () => {
        setShowAddPanel(true)
        setSaveSucceeded(false)
        setFormError(null)
        setFieldErrors([])
    }

    const closeAddPanel = () => setShowAddPanel(false)

    return {
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
        formFields: {
            name, setName,
            email, setEmail,
            phone, setPhone,
            skills, setSkills,
            experience, setExperience,
            currentCompany, setCurrentCompany,
            currentRole, setCurrentRole,
            tags, setTags,
            notes, setNotes,
            source, setSource,
        },
    }
}