import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { createJob } from '../services/JobServices'

type JobPopUpProps = {
  isOpen: boolean
  onClose: () => void
}

const JobPopUp = ({ isOpen, onClose }: JobPopUpProps) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const organizationId = location.pathname.match(
    /^\/organizations\/([^/]+)/,
  )?.[1]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!accessToken) {
      setError('You need to login first.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const job = await createJob({ title }, accessToken)
      setTitle('')
      onClose()
      navigate(
        `/organizations/${organizationId ?? job.organizationId}/jobs/${job.id}/setup`,
      )
    } catch (caughtError) {
      const message =
        typeof caughtError === 'object' &&
        caughtError !== null &&
        'message' in caughtError
          ? String(caughtError.message)
          : 'Could not create job.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create new job
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Add a title now, then complete the job setup next.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            X
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-gray-700">Job title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Frontend Engineer"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            required
          />
        </label>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create job'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobPopUp
