import type { Job } from '../services/JobSchema'

type JobDescriptionProps = {
  job: Job
}

const JobDescription = ({ job }: JobDescriptionProps) => {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Job description</h2>
      <p className="mt-1 text-sm text-gray-600">
        Review how this role will appear to candidates.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Title</h3>
          <p className="mt-1 text-gray-900">{job.title}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700">Description</h3>
          <p className="mt-1 whitespace-pre-line text-gray-700">
            {job.description === 'Draft job description'
              ? 'Description has not been completed yet.'
              : job.description}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">
              Requirements
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {job.requirements.length > 0 ? (
                job.requirements.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No requirements added.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700">
              Responsibilities
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {job.responsibilities.length > 0 ? (
                job.responsibilities.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No responsibilities added.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JobDescription
