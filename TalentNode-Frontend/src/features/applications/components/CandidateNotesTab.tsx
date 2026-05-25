import { useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import type { PrivateNoteItem } from '../services/ApplicationPrivateNoteServices'
import {
  createPrivateNoteForApplication,
  getPrivateNotesByApplication,
} from '../services/ApplicationPrivateNoteServices'

const CandidateNotesTab = ({
  jobId,
  applicationId,
}: {
  jobId: string
  applicationId: string
}) => {
  const accessToken = useAuthStore((state) => state.accessToken)

  const [notes, setNotes] = useState<PrivateNoteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const canLoad = useMemo(
    () => Boolean(accessToken && jobId && applicationId),
    [accessToken, jobId, applicationId],
  )

  useEffect(() => {
    if (!canLoad) {
      setNotes([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const data = await getPrivateNotesByApplication({
          jobId,
          applicationId,
          accessToken: accessToken!,
        })
        setNotes(data)
      } catch (e) {
        const message =
          typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message?: unknown }).message)
            : 'Could not load private notes.'
        setError(message)
      } finally {
        setLoading(false)
      }
    })()
  }, [canLoad, accessToken, jobId, applicationId])

  const handleSave = async () => {
    const trimmed = draft.trim()
    if (!accessToken || !trimmed || !jobId || !applicationId) return

    setSaving(true)
    setError(null)

    try {
      await createPrivateNoteForApplication({
        jobId,
        applicationId,
        privatenote: trimmed,
        accessToken,
      })

      setDraft('')
      const data = await getPrivateNotesByApplication({
        jobId,
        applicationId,
        accessToken,
      })
      setNotes(data)
    } catch (e) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not save private note.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
          Loading private notes...
        </div>
      ) : error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

        <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900">Private notes</h4>

        {notes.length === 0 ? (
          <p className="text-sm text-gray-600">No private notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((n, idx) => (
              <div
                key={n._id ?? `${idx}-${n.createdAt ?? ''}`}

                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <p className="whitespace-pre-wrap text-sm text-gray-900">
                  {n.text}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {typeof n.createdBy === 'string'
                    ? n.createdBy || 'Unknown'
                    : (n.createdBy as any)?.username ?? 'Unknown'}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleString()
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">
          Add a private note
        </label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a private note about this candidate..."
          className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !draft.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save note'}
          </button>
          <span className="text-xs text-gray-500">
            Notes are private to your organization.
          </span>
        </div>
      </div>
    </div>
  )
}

export default CandidateNotesTab

