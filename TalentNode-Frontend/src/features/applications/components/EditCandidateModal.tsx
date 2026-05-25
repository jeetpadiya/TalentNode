import { useEffect, useMemo, useState } from 'react'
import { editCandidate } from '../../candidates/services/CandidateServices'
import { useAuthStore } from '../../../app/store/AuthStore'
import type { Candidate } from '../../candidates/services/CandidateSchema'

type EditCandidateModalProps = {
  candidate: Candidate
  onClose: () => void
}

type EditFormState = {
  name: string
  email: string
  phone: string
  currentCompany: string
  currentRole: string
  experience: string
  skills: string
  tags: string
  notes: string
  source: string
  resume: string
}

const EditCandidateModal = ({ candidate, onClose }: EditCandidateModalProps) => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [isEditingCandidate] = useState(true)

  const [editForm, setEditForm] = useState<EditFormState>(() => ({
    name: candidate?.name ?? '',
    email: candidate?.email ?? '',
    phone: candidate?.phone ?? '',
    currentCompany: candidate?.currentCompany ?? '',
    currentRole: candidate?.currentRole ?? '',
    experience:
      candidate?.experience !== undefined && candidate?.experience !== null
        ? String(candidate.experience)
        : '',
    skills: candidate?.skills?.join(', ') ?? '',
    tags: candidate?.tags?.join(', ') ?? '',
    notes: candidate?.notes ?? '',
    source: (candidate?.source as string) ?? '',
    resume: candidate?.resume ?? '',
  }))

  useEffect(() => {
    if (!isEditingCandidate) return
    setEditForm({
      name: candidate?.name ?? '',
      email: candidate?.email ?? '',
      phone: candidate?.phone ?? '',
      currentCompany: candidate?.currentCompany ?? '',
      currentRole: candidate?.currentRole ?? '',
      experience:
        candidate?.experience !== undefined && candidate?.experience !== null
          ? String(candidate.experience)
          : '',
      skills: candidate?.skills?.join(', ') ?? '',
      tags: candidate?.tags?.join(', ') ?? '',
      notes: candidate?.notes ?? '',
      source: (candidate?.source as string) ?? '',
      resume: candidate?.resume ?? '',
    })
  }, [candidate, isEditingCandidate])

  const [editError, setEditError] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSaveCandidate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!candidate?._id) return
    setEditSaving(true)
    setEditError(null)

    try {
      if (!accessToken) throw new Error('Missing access token')

      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        currentCompany: editForm.currentCompany.trim() || undefined,
        currentRole: editForm.currentRole.trim() || undefined,
        experience:
          editForm.experience.trim() === '' ? undefined : Number(editForm.experience),
        skills: editForm.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        tags: editForm.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        notes: editForm.notes.trim() || undefined,
        source: (editForm.source || undefined) as any,
        resume: editForm.resume.trim() || undefined,
      }

      await editCandidate(candidate._id, payload as any, accessToken)
      onClose()
    } catch (e: any) {
      setEditError(e?.message ?? 'Failed to update candidate')
    } finally {
      setEditSaving(false)
    }
  }

  const modalContent = useMemo(() => {
    return (
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <form onSubmit={handleSaveCandidate} className="flex flex-col">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit candidate</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {(editError || null) && (
              <p className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            )}
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Name</span>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Phone</span>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Experience (years)
                </span>
                <input
                  inputMode="decimal"
                  value={editForm.experience}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, experience: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Current company</span>
                <input
                  value={editForm.currentCompany}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, currentCompany: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Current role</span>
                <input
                  value={editForm.currentRole}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, currentRole: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Skills (comma separated)
                </span>
                <input
                  value={editForm.skills}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, skills: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">
                  Tags (comma separated)
                </span>
                <input
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, tags: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Resume URL</span>
                <input
                  value={editForm.resume}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, resume: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Notes</span>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Source</span>
                <select
                  value={editForm.source}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, source: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Naukri">Naukri</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSaving}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }, [editError, editForm, editSaving, onClose, candidate._id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit candidate"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {modalContent}
    </div>
  )
}

export default EditCandidateModal

