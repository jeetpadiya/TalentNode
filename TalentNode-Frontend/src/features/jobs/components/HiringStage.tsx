import type { Job } from '../services/JobSchema'

type HiringStageProps = {
  job: Job
}

const HiringStage = ({ job }: HiringStageProps) => {
  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Hiring stages</h2>
      <p className="mt-1 text-sm text-gray-600">
        Pipeline stages candidates will move through for {job.title}.
      </p>

      <div className="mt-6 grid gap-3">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-800">{stage}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HiringStage
