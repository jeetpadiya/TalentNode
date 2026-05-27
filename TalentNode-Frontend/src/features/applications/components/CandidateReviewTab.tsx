import { useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import { getReviewRequests } from '../services/applicationReviewService'
import {
  createPrivateNoteForApplication,
  getPrivateNotesByApplication,
} from '../services/ApplicationPrivateNoteServices'
import {
  reviewTemplatesService,
  type ReviewTemplate,
} from '../../settings/services/reviewTemplatesService'

type CandidateReviewTabProps = {
  jobId: string
  applicationId: string
}

type ReviewDraft = {
  rating: number | ''
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire' | ''
  reviewNotes: string
}

const defaultDraft: ReviewDraft = {
  rating: '',
  recommendation: '',
  reviewNotes: '',
}

const CandidateReviewTab = ({ jobId, applicationId }: CandidateReviewTabProps) => {
  const role = useAuthStore((state) => state.user?.role) as
    | 'admin'
    | 'recruiter'
    | 'hiring_manager'
    | 'interviewer'
    | 'candidate'
    | undefined

  const accessToken = useAuthStore((state) => state.accessToken)

  // Visibility rules (frontend):
  // - Admin / Hiring Manager / Interviewer / Recruiter can VIEW the tab
  // - Submit/Edit are still constrained by backend role checks and by UI disablement where applicable
  const canView = role !== undefined && role !== 'candidate'

  // Submit rules
  const canSubmit =
    role === 'admin' || role === 'hiring_manager' || role === 'interviewer'

  // Recruiters may view but should not be allowed to submit in this UI.
  const canEdit = canSubmit

  const [draft, setDraft] = useState<ReviewDraft>(defaultDraft)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canLoad = useMemo(
    () => Boolean(accessToken && jobId && applicationId && canView),
    [accessToken, jobId, applicationId, canView],
  )

  const [reviewRequests] = useState<
    Awaited<ReturnType<typeof getReviewRequests>>
  >([])
  const [existingText, setExistingText] = useState<string>('')

  const [templates, setTemplates] = useState<ReviewTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const userOrgId = useAuthStore((state) => state.user?.organizationId)

  useEffect(() => {
    if (!accessToken || !userOrgId || !canView) return

    const fetchTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const data = await reviewTemplatesService.listReviewTemplates(
          accessToken,
          userOrgId as string,
        )
        setTemplates(data)
      } catch (e) {
        console.error('Failed to load review templates', e)
      } finally {
        setLoadingTemplates(false)
      }
    }

    void fetchTemplates()
  }, [accessToken, userOrgId, canView])

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value
    setSelectedTemplateId(tId)

    if (tId) {
      const template = templates.find((t) => t._id === tId)
      if (template) {
        setDraft((prev) => ({
          ...prev,
          reviewNotes: prev.reviewNotes
            ? prev.reviewNotes + '\n\n' + template.template
            : template.template,
        }))
      }
    }
  }

  const formatReviewAsPrivateNote = (value: ReviewDraft) => {
    const ratingPart = value.rating === '' ? '' : `Rating: ${value.rating}/10\n`
    const recPart = value.recommendation
      ? `Recommendation: ${value.recommendation.replace(/_/g, ' ')}\n`
      : ''

    const notesPart = value.reviewNotes.trim()
      ? `Review Notes:\n${value.reviewNotes.trim()}\n`
      : ''

    return [
      ratingPart,
      recPart,
      notesPart,
    ]
      .filter(Boolean)
      .join('')
      .trim()
  }

  const handleLoad = async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const notes = await getPrivateNotesByApplication({
        jobId,
        applicationId,
        accessToken,
      })

      // best effort: use last note text
      const last = notes?.[notes.length - 1]
      setExistingText(last?.text ?? '')
    } catch (e) {
      setError(
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not load review.',
      )
    } finally {
      setLoading(false)
    }
  }

  // Lazy-load existing note in a way that matches current app patterns
  // eslint-disable-next-line react-hooks/rules-of-hooks
  ;

  useEffect(() => {
    if (!canLoad) return
    void handleLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad])




  const handleSave = async () => {
    if (!accessToken) return
    if (!canEdit) return

    const payloadText = formatReviewAsPrivateNote(draft)
    if (!payloadText) return

    setSaving(true)
    setError(null)
    try {
      await createPrivateNoteForApplication({
        jobId,
        applicationId,
        privatenote: payloadText,
        accessToken,
      })

      // reload for immediate UI confirmation
      await handleLoad()
      setDraft(defaultDraft)
    } catch (e) {
      setError(
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not save review.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!canView) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        You don’t have permission to view interviewer feedback.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Interviewer feedback</h3>
        <p className="mt-1 text-xs text-gray-500">
          Saved as interviewer feedback in private notes (until scorecard model is added).
        </p>
      </div>

      {!canSubmit ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your role can view this, but can’t submit feedback.
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
          Loading review...
        </div>
      ) : null}

      {reviewRequests.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-700">Review requests</p>
          <div className="mt-2 space-y-2">
            {reviewRequests.map((r) => (
              <div key={r.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {r.assignee?.username || r.assignee?.email || r.assignee?.id}
                  </p>
                  <span className="text-xs font-semibold text-gray-600">
                    {r.status}
                  </span>
                </div>
                {r.message ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                    {r.message}
                  </p>
                ) : null}
                <div className="mt-1 text-xs text-gray-500">
                  Requested by: {r.requestedBy?.username || r.requestedBy?.email || r.requestedBy?.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : existingText ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-700">Latest saved review</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
            {existingText}
          </pre>
        </div>
      ) : null}


      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-900">Rating (0-10)</label>
          <input
            type="number"
            min={0}
            max={10}
            step={1}
            value={draft.rating}
            disabled={!canEdit}
            onChange={(e) => {
              const raw = e.target.value
              setDraft((p) => ({
                ...p,
                rating: raw === '' ? '' : Number(raw),
              }))
            }}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-900">Recommendation</label>
          <select
            value={draft.recommendation}
            disabled={!canEdit}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                recommendation: e.target.value as ReviewDraft['recommendation'],
              }))
            }
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
          >
            <option value="">Select</option>
            <option value="strong_hire">Strong Hire</option>
            <option value="hire">Hire</option>
            <option value="no_hire">No Hire</option>
            <option value="strong_no_hire">Strong No Hire</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-900">
          Insert Review Template
        </label>
        <select
          value={selectedTemplateId}
          onChange={handleTemplateChange}
          disabled={!canEdit || loadingTemplates}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
        >
          <option value="">-- Select a template --</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-gray-900">
          Review Notes
        </span>
        <textarea
          value={draft.reviewNotes}
          disabled={!canEdit}
          onChange={(e) =>
            setDraft((p) => ({ ...p, reviewNotes: e.target.value }))
          }
          placeholder="Insert a review template or write your interview notes here..."
          className="min-h-[200px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !canEdit || !draft.reviewNotes.trim()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Submit feedback'}
        </button>
        <span className="text-xs text-gray-500">
          Interviewers recommend; pipeline movement is handled by recruiters/hiring managers.
        </span>
      </div>
    </div>
  )
}

export default CandidateReviewTab

