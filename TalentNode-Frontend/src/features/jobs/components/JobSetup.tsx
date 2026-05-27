import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getJobById, updateJob, updateJobPublish } from '../services/JobServices'
import type { Job } from '../services/JobSchema'
import JobSetupForm from './JobSetupForm'
import JobSetupHeader from './JobSetupHeader'
import JobWorkspaceTabs from './JobWorkspaceTabs'
import { jobCategoriesService } from '../../settings/services/jobCategoriesService'
import type { JobCategory } from '../../settings/services/jobCategoriesService'
import {
  joinList,
  splitList,
} from './jobSetupUtils'
import {
  deriveDepartmentSelection,
  serializeDepartmentForBackend,
} from './JobSetupDepartmentMapper'



const JobSetup = () => {
  const { organizationId, jobId } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [title, setTitle] = useState('')
  const [jobCategory, setJobCategory] = useState('')
  const [jobCategories, setJobCategories] = useState<JobCategory[]>([])
  const [jobCategoriesLoading, setJobCategoriesLoading] = useState(true)

  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState<Job['workMode']>('onsite')
  const [employmentType, setEmploymentType] =
    useState<Job['employmentType']>('full_time')
  const [experienceLevel, setExperienceLevel] =
    useState<Job['experienceLevel']>('junior')
  const [description, setDescription] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [requirements, setRequirements] = useState('')
  const [niceToHave, setNiceToHave] = useState('')
  const [skills, setSkills] = useState('')
  const [tags, setTags] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [openings, setOpenings] = useState('1')
  const [status, setStatus] = useState<Job['status']>('draft')
  const [applicationDeadline, setApplicationDeadline] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingPublish, setIsTogglingPublish] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadJobCategories = async () => {
      if (!accessToken || !organizationId) {
        setJobCategories([])
        setJobCategoriesLoading(false)
        return
      }

      try {
        const categories = await jobCategoriesService.listJobCategories(
          accessToken,
          organizationId,
        )
        if (isMounted) {
          setJobCategories(categories)
        }
      } catch {
        if (isMounted) {
          setJobCategories([])
        }
      } finally {
        if (isMounted) {
          setJobCategoriesLoading(false)
        }
      }
    }

    void loadJobCategories()

    return () => {
      isMounted = false
    }
  }, [accessToken, organizationId])

  useEffect(() => {
    let isMounted = true

    const loadJob = async () => {
      if (!accessToken || !jobId) {
        setError('Job could not be loaded.')
        setIsLoading(false)
        return
      }

      try {
        const response = await getJobById(jobId, accessToken)

        if (isMounted) {
          setJob(response)
          setTitle(response.title)
          const selection = deriveDepartmentSelection(
            jobCategories,
            response.department,
          )
          setJobCategory(selection.categoryId)


          setLocation(response.location ?? '')
          setWorkMode(response.workMode)
          setEmploymentType(response.employmentType)
          setExperienceLevel(response.experienceLevel)
          setDescription(
            response.description === 'Draft job description'
              ? ''
              : response.description,
          )
          setResponsibilities(joinList(response.responsibilities))
          setRequirements(joinList(response.requirements))
          setNiceToHave(joinList(response.niceToHave))
          setSkills(response.skills.join(', '))
          setTags(response.tags.join(', '))
          setSalaryMin(response.salaryMin?.toString() ?? '')
          setSalaryMax(response.salaryMax?.toString() ?? '')
          setCurrency(response.currency)
          setOpenings(response.openings.toString())
          setStatus(response.status)
          setApplicationDeadline(
            response.applicationDeadline
              ? response.applicationDeadline.slice(0, 10)
              : '',
          )
          setError(null)
        }
      } catch (caughtError) {
        const message =
          typeof caughtError === 'object' &&
          caughtError !== null &&
          'message' in caughtError
            ? String(caughtError.message)
            : 'Could not load job.'

        if (isMounted) {
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadJob()

    return () => {
      isMounted = false
    }
  }, [accessToken, jobId])


  const handleAddCandidate = () => {
    if (!organizationId) return

    const params = new URLSearchParams()
    if (jobId) params.set('job', jobId)
    params.set('add', '1')

    navigate(`/organizations/${organizationId}/candidates?${params.toString()}`)
  }

  const handleCancel = () => {
    navigate(`/organizations/${organizationId}/jobs`)
  }

  const handleTogglePublish = async () => {
    if (!accessToken || !jobId || !job) return
    setIsTogglingPublish(true)
    setError(null)
    try {
      const updated = await updateJobPublish(jobId, !job.isPublished, accessToken)
      setJob(updated)
      setStatus(updated.status)
    } catch (caughtError) {
      const message =
        typeof caughtError === 'object' && caughtError !== null && 'message' in caughtError
          ? String(caughtError.message)
          : 'Could not update publish status.'
      setError(message)
    } finally {
      setIsTogglingPublish(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!accessToken || !jobId) {
      setError('Job could not be saved.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await updateJob(
        jobId,
        {
          title,
          department:
            jobCategory
              ? (() => {
                  // jobCategory state is the value stored in JobsModel.department.
                  // Ensure we serialize it back into the stable backend format.
                  const selection = deriveDepartmentSelection(
                    jobCategories,
                    jobCategory,
                  )

                  return serializeDepartmentForBackend(selection)
                })() ?? undefined
              : undefined,


          location: location || undefined,
          workMode,
          employmentType,
          experienceLevel,
          description,
          responsibilities: splitList(responsibilities),
          requirements: splitList(requirements),
          niceToHave: splitList(niceToHave),
          skills: skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
          currency,
          openings: Number(openings),
          status,
          applicationDeadline: applicationDeadline
            ? new Date(applicationDeadline).toISOString()
            : undefined,
          isPublished: status === 'open',
        },
        accessToken,
      )

      // Stay on the same job setup page after saving.
      // Optionally, you could refetch job data here if needed.
    } catch (caughtError) {
      const message =
        typeof caughtError === 'object' &&
        caughtError !== null &&
        'message' in caughtError
          ? String(caughtError.message)
          : 'Could not save job.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading job setup...</p>
  }

  if (error && !job) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  return (
    <section className="mx-auto max-w-4xl">
      <JobSetupHeader
        title={title}
        isPublished={job?.isPublished ?? false}
        status={status}
        isTogglingPublish={isTogglingPublish}
        canAddCandidate={Boolean(organizationId)}
        onAddCandidate={handleAddCandidate}
        onTogglePublish={handleTogglePublish}
      />

      <JobWorkspaceTabs />

      <JobSetupForm
        title={title}
        setTitle={setTitle}
        department={jobCategory}
        setDepartment={setJobCategory}
        categories={jobCategories}
        departmentDisabled={jobCategoriesLoading}
        location={location}
        setLocation={setLocation}

        workMode={workMode}
        setWorkMode={setWorkMode}
        employmentType={employmentType}
        setEmploymentType={setEmploymentType}
        experienceLevel={experienceLevel}
        setExperienceLevel={setExperienceLevel}
        description={description}
        setDescription={setDescription}
        responsibilities={responsibilities}
        setResponsibilities={setResponsibilities}
        requirements={requirements}
        setRequirements={setRequirements}
        niceToHave={niceToHave}
        setNiceToHave={setNiceToHave}
        skills={skills}
        setSkills={setSkills}
        tags={tags}
        setTags={setTags}
        salaryMin={salaryMin}
        setSalaryMin={setSalaryMin}
        salaryMax={salaryMax}
        setSalaryMax={setSalaryMax}
        currency={currency}
        setCurrency={setCurrency}
        openings={openings}
        setOpenings={setOpenings}
        status={status}
        setStatus={setStatus}
        applicationDeadline={applicationDeadline}
        setApplicationDeadline={setApplicationDeadline}
        error={error}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

export default JobSetup
