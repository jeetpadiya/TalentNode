import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { useCreateJobMutation } from '../../../hooks/useTalentQueries'

type JobPopUpProps = {
  isOpen: boolean
  onClose: () => void
}

const JobPopUp = ({ isOpen, onClose }: JobPopUpProps) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const createJobMutation = useCreateJobMutation()

  const organizationId = location.pathname.match(
    /^\/organizations\/([^/]+)/,
  )?.[1]

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!accessToken) {
      setError('You need to login first.')
      return
    }

    if (!title.trim()) {
      setError('Job title is required.')
      return
    }

    setError(null)

    try {
      const response = await createJobMutation.mutateAsync({ title: title.trim() })
      const createdJob = response.job
      setTitle('')
      onClose()
      navigate(
        `/organizations/${organizationId ?? createdJob.organizationId}/jobs/${createdJob.id}/setup`,
      )
    } catch (caughtError: any) {
      const message =
        caughtError?.message ??
        (typeof caughtError === 'string' ? caughtError : 'Could not create job.')
      setError(message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-900">Create New Job</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4">
          <label
            htmlFor="job-title"
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            id="job-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            autoFocus
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={createJobMutation.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createJobMutation.isPending}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobPopUp
