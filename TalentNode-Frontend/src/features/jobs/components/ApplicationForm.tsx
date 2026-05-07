import type { Job } from '../services/JobSchema'

type ApplicationFormProps = {
  job: Job
}

const ApplicationForm = ({ job }: ApplicationFormProps) => {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Application form
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Configure what candidates submit when applying for {job.title}.
      </p>

      <div className="mt-6 grid gap-3">
        {['Full name', 'Email address', 'Phone number', 'Resume', 'Cover letter'].map(
          (field) => (
            <label
              key={field}
              className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-700"
            >
              <span>{field}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
          ),
        )}
      </div>
    </section>
  )
}

export default ApplicationForm
