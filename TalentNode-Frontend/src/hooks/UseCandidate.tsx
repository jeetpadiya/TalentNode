import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../app/store/AuthStore'
import {
  useJobsQuery,
  useJobCandidatesQuery,
  useCreateCandidateMutation,
} from './useTalentQueries'
import type { Candidate, Job as OrgJob } from '../types/apiTypes'

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

  // 1. Fetch organization's jobs using TanStack Query
  const { data: jobs = [], isLoading: jobsLoading } = useJobsQuery(
    organizationId,
    accessToken,
  )
  const hasAutoSelectedRef = useRef(false)

  // 2. Fetch candidates for currently selected job using TanStack Query
  const {
    data: candidates = [],
    isLoading: listLoading,
    error: listQueryError,
  } = useJobCandidatesQuery(organizationId, selectedJobId, accessToken)

  // 3. Mutation for creating and linking candidate
  const createCandidateMutation = useCreateCandidateMutation()

  const [showAddPanel, setShowAddPanel] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ field: string; message: string }[]>([])
  const [saveSucceeded, setSaveSucceeded] = useState(false)

  // Form Fields
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

  // Sync add panel state from query parameters
  useEffect(() => {
    if (searchParams.get('add') !== '1') return
    setShowAddPanel(true)
    const next = new URLSearchParams(searchParams)
    next.delete('add')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  // Auto-select first job if none is currently selected in search params
  useEffect(() => {
    if (jobs.length > 0 && !hasAutoSelectedRef.current) {
      const currentJobId =
        searchParams.get('job')?.trim() ||
        searchParams.get('fromJob')?.trim() ||
        ''
      if (!currentJobId || !jobs.some((j) => j.id === currentJobId)) {
        hasAutoSelectedRef.current = true
        const next = new URLSearchParams(searchParams)
        next.set('job', jobs[0].id)
        next.delete('fromJob')
        setSearchParams(next, { replace: true })
      }
    }
  }, [jobs, searchParams, setSearchParams])

  const setJobSelection = (jobId: string) => {
    hasAutoSelectedRef.current = true
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

    try {
      await createCandidateMutation.mutateAsync({
        name,
        email,
        phone: phone.trim() || undefined,
        skills,
        experience: experience.trim() || undefined,
        currentCompany: currentCompany.trim() || undefined,
        currentRole: currentRole.trim() || undefined,
        tags,
        notes,
        source: source || undefined,
        jobId: selectedJobId,
      })

      // Reset form on success
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
    } catch (caughtError: any) {
      if (caughtError?.errors && Array.isArray(caughtError.errors)) {
        setFieldErrors(caughtError.errors)
      }
      const message =
        caughtError?.message ??
        (typeof caughtError === 'string' ? caughtError : 'Could not create candidate.')
      setFormError(message)
    }
  }

  const openAddPanel = () => {
    setShowAddPanel(true)
    setSaveSucceeded(false)
    setFormError(null)
    setFieldErrors([])
  }

  const closeAddPanel = () => setShowAddPanel(false)

  const listError = listQueryError
    ? listQueryError instanceof Error
      ? listQueryError.message
      : 'Could not load candidates.'
    : null

  return {
    dashboardHref,
    selectedJobId,
    selectedJob: selectedJob as unknown as OrgJob | null,
    jobs: jobs as unknown as OrgJob[],
    jobsLoading,
    showAddPanel,
    openAddPanel,
    closeAddPanel,
    candidates: candidates as unknown as Candidate[],
    listLoading,
    listError,
    formError,
    fieldErrors,
    isSubmitting: createCandidateMutation.isPending,
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