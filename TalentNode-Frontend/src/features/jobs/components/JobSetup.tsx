import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getJobById, updateJob} from '../services/JobServices'
import type { Job } from '../services/JobSchema'
import ApplicationForm from './ApplicationForm'
import HiringStage from './HiringStage'
import { HiringTeam } from './HiringTeam'
import JobDescription from './JobDescription'
import { FaPlus } from "react-icons/fa";


const splitList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const joinList = (value: string[]) => value.join('\n')

type JobWorkspaceSection =
  | 'setup'
  | 'description'
  | 'application_form'
  | 'hiring_stage'
  | 'hiring_team'

const jobWorkspaceSections: Array<{
  id: JobWorkspaceSection
  label: string
}> = [
  { id: 'setup', label: 'Job setup' },
  { id: 'description', label: 'Job description' },
  { id: 'application_form', label: 'Application form' },
  { id: 'hiring_stage', label: 'Hiring stages' },
  { id: 'hiring_team', label: 'Hiring team' },
]

const JobSetup = () => {
  const { organizationId, jobId } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
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
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] =
    useState<JobWorkspaceSection>('setup')

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
          setDepartment(response.department ?? '')
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
          department: department || undefined,
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

      navigate(`/organizations/${organizationId}/jobs`)
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
      <div className="mb-6 gap-2 ">
        <h1 className="text-2xl font-bold text-gray-900">
          {title || 'Job workspace'}
          <FaPlus className="ml-2 inline-block h-4 w-4 text-gray-600" />  
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Switch between setup, description, application form, hiring stages,
          and hiring team for this job.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {jobWorkspaceSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeSection === section.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            ].join(' ')}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'setup' ? (
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Department
            </span>
            <input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Employment type
            </span>
            <select
              value={employmentType}
              onChange={(event) =>
                setEmploymentType(event.target.value as Job['employmentType'])
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Work mode
            </span>
            <select
              value={workMode}
              onChange={(event) =>
                setWorkMode(event.target.value as Job['workMode'])
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Experience level
            </span>
            <select
              value={experienceLevel}
              onChange={(event) =>
                setExperienceLevel(
                  event.target.value as Job['experienceLevel'],
                )
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            required
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Responsibilities
            </span>
            <textarea
              value={responsibilities}
              onChange={(event) => setResponsibilities(event.target.value)}
              className="mt-1 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Requirements
            </span>
            <textarea
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              className="mt-1 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Nice to have
            </span>
            <textarea
              value={niceToHave}
              onChange={(event) => setNiceToHave(event.target.value)}
              className="mt-1 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Skills
              </span>
              <input
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="React, TypeScript, Node.js"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Tags</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="urgent, product"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Salary min
            </span>
            <input
              type="number"
              value={salaryMin}
              onChange={(event) => setSalaryMin(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Salary max
            </span>
            <input
              type="number"
              value={salaryMax}
              onChange={(event) => setSalaryMax(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Currency</span>
            <input
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 uppercase outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Openings</span>
            <input
              type="number"
              min={1}
              value={openings}
              onChange={(event) => setOpenings(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as Job['status'])}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Deadline
            </span>
            <input
              type="date"
              value={applicationDeadline}
              onChange={(event) => setApplicationDeadline(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/organizations/${organizationId}/jobs`)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save job'}
          </button>
        </div>
      </form>
      ) : null}

      {activeSection === 'description' && job ? (
        <JobDescription
          job={{
            ...job,
            title,
            description: description || job.description,
            responsibilities: splitList(responsibilities),
            requirements: splitList(requirements),
          }}
        />
      ) : null}

      {activeSection === 'application_form' && job ? (
        <ApplicationForm job={{ ...job, title }} />
      ) : null}

      {activeSection === 'hiring_stage' && job ? (
        <HiringStage job={{ ...job, title }} />
      ) : null}

      {activeSection === 'hiring_team' && job ? (
        <HiringTeam job={{ ...job, title }} />
      ) : null}
    </section>
  )
}

export default JobSetup
