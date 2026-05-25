import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuthStore } from '../../../app/store/AuthStore'
import {
  getHiringTeamForJob,
  type HiringTeamMember,
} from '../../jobs/services/JobTeamServices'
import { createReviewRequest } from '../services/applicationReviewService'

type RequestReviewModalProps = {
  jobId: string
  applicationId: string
  candidateName: string
  onClose: () => void
  onSuccess?: () => void
}

const REVIEWER_ROLES = new Set(['hiring_manager', 'interviewer'])

const RequestReviewModal = ({
  jobId,
  applicationId,
  candidateName,
  onClose,
  onSuccess,
}: RequestReviewModalProps) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentUserId = useAuthStore((s) => s.user?.id)

  const [reviewers, setReviewers] = useState<HiringTeamMember[]>([])
  const [assigneeUserId, setAssigneeUserId] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false)
      setError('You need to be signed in to request a review.')
      return
    }

    void (async () => {
      setIsLoading(true)
      setError(null)
      try {
        const team = await getHiringTeamForJob(jobId, accessToken)
        const eligible = [
          ...team.hiringTeam.hiringManagers,
          ...team.hiringTeam.interviewers,
        ].filter(
          (member) =>
            REVIEWER_ROLES.has(member.role) &&
            member.user.id !== currentUserId,
        )
        setReviewers(eligible)
        setAssigneeUserId(eligible[0]?.user.id ?? '')
      } catch (err) {
        const nextMessage =
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message?: string }).message)
            : 'Could not load hiring team.'
        setError(nextMessage)
        setReviewers([])
      } finally {
        setIsLoading(false)
      }
    })()
  }, [accessToken, currentUserId, jobId])

  const reviewerOptions = useMemo(
    () =>
      reviewers.map((member) => {
        const label =
          member.user.username ||
          member.user.email ||
          `User ${member.user.id.slice(-6)}`
        const roleLabel =
          member.role === 'hiring_manager' ? 'Hiring Manager' : 'Interviewer'
        return { value: member.user.id, label: `${label} (${roleLabel})` }
      }),
    [reviewers],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accessToken || !assigneeUserId) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createReviewRequest(jobId, applicationId, accessToken, {
        assigneeUserId,
        message: message.trim() || undefined,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      const nextMessage =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Could not send review request.'
      setError(nextMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-review-title"
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="request-review-title"
              className="text-lg font-semibold text-gray-900"
            >
              Request review
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Ask a hiring team member to submit feedback for{' '}
              <span className="font-medium text-gray-900">{candidateName}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-gray-600">Loading hiring team…</p>
        ) : reviewers.length === 0 ? (
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add a hiring manager or interviewer to this job&apos;s hiring team
            before requesting a review.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-gray-900">
                Assign to
              </span>
              <select
                value={assigneeUserId}
                onChange={(e) => setAssigneeUserId(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900"
              >
                {reviewerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-gray-900">
                Message (optional)
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="What should the reviewer focus on?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>

            {error ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !assigneeUserId}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </form>
        )}

        {!isLoading && reviewers.length === 0 ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default RequestReviewModal
