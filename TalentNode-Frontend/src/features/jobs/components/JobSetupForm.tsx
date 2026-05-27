import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Job } from '../services/JobSchema'


import type { JobCategory } from '../../settings/services/jobCategoriesService'
import JobDepartmentSelect from './JobDepartmentSelect'

type JobSetupFormProps = {
  title: string
  setTitle: Dispatch<SetStateAction<string>>
  department: string
  setDepartment: Dispatch<SetStateAction<string>>
  categories: JobCategory[]
  departmentDisabled?: boolean

  location: string
  setLocation: Dispatch<SetStateAction<string>>
  workMode: Job['workMode']
  setWorkMode: Dispatch<SetStateAction<Job['workMode']>>
  employmentType: Job['employmentType']
  setEmploymentType: Dispatch<SetStateAction<Job['employmentType']>>
  experienceLevel: Job['experienceLevel']
  setExperienceLevel: Dispatch<SetStateAction<Job['experienceLevel']>>
  description: string
  setDescription: Dispatch<SetStateAction<string>>
  responsibilities: string
  setResponsibilities: Dispatch<SetStateAction<string>>
  requirements: string
  setRequirements: Dispatch<SetStateAction<string>>
  niceToHave: string
  setNiceToHave: Dispatch<SetStateAction<string>>
  skills: string
  setSkills: Dispatch<SetStateAction<string>>
  tags: string
  setTags: Dispatch<SetStateAction<string>>
  salaryMin: string
  setSalaryMin: Dispatch<SetStateAction<string>>
  salaryMax: string
  setSalaryMax: Dispatch<SetStateAction<string>>
  currency: string
  setCurrency: Dispatch<SetStateAction<string>>
  openings: string
  setOpenings: Dispatch<SetStateAction<string>>
  status: Job['status']
  setStatus: Dispatch<SetStateAction<Job['status']>>
  applicationDeadline: string
  setApplicationDeadline: Dispatch<SetStateAction<string>>
  error: string | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}


const JobSetupForm = ({
  title,
  setTitle,
  department,
  setDepartment,
  categories,
  departmentDisabled,
  location,
  setLocation,
  workMode,
  setWorkMode,
  employmentType,
  setEmploymentType,
  experienceLevel,
  setExperienceLevel,
  description,
  setDescription,
  responsibilities,
  setResponsibilities,
  requirements,
  setRequirements,
  niceToHave,
  setNiceToHave,
  skills,
  setSkills,
  tags,
  setTags,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  currency,
  setCurrency,
  openings,
  setOpenings,
  status,
  setStatus,
  applicationDeadline,
  setApplicationDeadline,
  error,
  isSubmitting,
  onCancel,
  onSubmit,
}: JobSetupFormProps) => {

  return (
    <form
      onSubmit={onSubmit}
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
            Job category
          </span>
          <JobDepartmentSelect
            categories={categories}
            value={department}
            onChange={setDepartment}
            disabled={departmentDisabled}
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
          <span className="text-sm font-medium text-gray-700">Work mode</span>
          <select
            value={workMode}
            onChange={(event) => setWorkMode(event.target.value as Job['workMode'])}
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
              setExperienceLevel(event.target.value as Job['experienceLevel'])
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
        <span className="text-sm font-medium text-gray-700">Description</span>
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
          <span className="text-sm font-medium text-gray-700">Requirements</span>
          <textarea
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            className="mt-1 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nice to have</span>
          <textarea
            value={niceToHave}
            onChange={(event) => setNiceToHave(event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        <div className="grid gap-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Skills</span>
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
          <span className="text-sm font-medium text-gray-700">Salary min</span>
          <input
            type="number"
            value={salaryMin}
            onChange={(event) => setSalaryMin(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Salary max</span>
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
          <span className="text-sm font-medium text-gray-700">Deadline</span>
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
          onClick={onCancel}
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
  )
}

export default JobSetupForm
