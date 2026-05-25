import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { Job } from '../services/JobSchema'

type HiringTeamProps = {
  job: Job
}

import { useAuthStore } from '../../../app/store/AuthStore'
import {
  addHiringTeamMemberForJob,
  getHiringTeamForJob,
  removeHiringTeamMemberForJob,
  type HiringTeamMember,
  type HiringTeamResponse,
  type HiringTeamUser,
} from '../services/JobTeamServices'

type OwnerUser = {
  id: string
  username?: string | null
  email?: string | null
  role?: string | null
}

export const HiringTeam = ({ job }: HiringTeamProps) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [owner, setOwner] = useState<OwnerUser | null>(null)
  const [team, setTeam] = useState<HiringTeamResponse['hiringTeam']>({
    recruiters: [],
    hiringManagers: [],
    interviewers: [],
  })
  const [availableMembers, setAvailableMembers] = useState<HiringTeamUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const selectedMember = availableMembers.find(
    (member) => member.id === selectedUserId,
  )

  const loadHiringTeam = useCallback(async () => {
    if (!accessToken || !job?.id) return

    setLoading(true)
    setError(null)

    try {
      const data = await getHiringTeamForJob(job.id, accessToken)
      setOwner(data.owner as OwnerUser | null)
      setTeam(data.hiringTeam)
      setAvailableMembers(data.availableMembers)
      setSelectedUserId(data.availableMembers[0]?.id ?? '')
    } catch (e) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not load hiring team.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [accessToken, job?.id])

  useEffect(() => {
    if (!accessToken || !job?.id) return
    void loadHiringTeam()
  }, [accessToken, job?.id, loadHiringTeam])

  const onAddTeamMember = async () => {
    setMenuOpen(false)
    setShowAddForm(true)
  }

  const onRemoveNonAdmins = async () => {
    setMenuOpen(false)
    if (!accessToken || !job?.id) return

    setSaving(true)
    setError(null)

    try {
      const members = [
        ...team.recruiters,
        ...team.hiringManagers,
        ...team.interviewers,
      ]

      await Promise.all(
        members.map((member) =>
          removeHiringTeamMemberForJob(job.id, accessToken, member.user.id),
        ),
      )
      await loadHiringTeam()
    } catch (e) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not remove hiring team members.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accessToken || !job?.id || !selectedUserId) return

    setSaving(true)
    setError(null)

    try {
      await addHiringTeamMemberForJob(job.id, accessToken, {
        userId: selectedUserId,
      })
      setShowAddForm(false)
      await loadHiringTeam()
    } catch (e) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not add hiring team member.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async (member: HiringTeamMember) => {
    if (!accessToken || !job?.id) return

    setSaving(true)
    setError(null)

    try {
      await removeHiringTeamMemberForJob(job.id, accessToken, member.user.id)
      await loadHiringTeam()
    } catch (e) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Could not remove hiring team member.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const renderMembers = (label: string, members: HiringTeamMember[]) => (
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
        {label}
      </div>
      {members.length === 0 ? (
        <div className="px-3 py-3 text-sm text-gray-500">No members assigned.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 px-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900">
                  {member.user.username ?? member.user.email ?? 'Unknown user'}
                </div>
                <div className="text-xs text-gray-500">
                  {member.user.email ?? 'No email'}
                </div>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleRemoveMember(member)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Hiring team</h2>
          <p className="mt-0.5 text-sm text-gray-600">
            Add recruiters, hiring managers, and interviewers for {job.title}.
          </p>
        </div>


        {/* right-side three dots */}
        <div className="relative">
          <button
            type="button"
            aria-label="Hiring team menu"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="block text-xl leading-none">⋮</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-10 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div className="grid gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
                  onClick={onAddTeamMember}
                >
                  Add a team member
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
                  onClick={onRemoveNonAdmins}
                >
                  Remove all-non admin in hiring team
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm ? (
        <form
          onSubmit={handleAddMember}
          className="mt-4 grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
        >
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
              Team member
            </span>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="" disabled>
                Select member
              </option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username ?? member.email ?? member.id} · {member.role}
                </option>
              ))}
            </select>
          </label>

          <div className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
              Job role
            </span>
            <div className="mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
              {selectedMember?.role ?? 'Select member'}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={saving || !selectedUserId}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}


      <div className="mt-4">
        {loading ? (
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
            Loading owner...
          </div>
        ) : error ? (
          <p className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700"
                  aria-hidden
                >
                  {owner?.username?.[0]?.toUpperCase() ?? 'O'}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Owner</p>
                  {owner ? (
                    <div className="mt-0.5 text-sm leading-tight text-gray-700">
                      <div className="font-medium">{owner.username ?? owner.email ?? '—'}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{owner.email ?? '—'}</div>
                      <div className="mt-0.5 text-xs text-gray-500">Role: {owner.role ?? '—'}</div>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-600">No owner found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {renderMembers('Recruiters', team.recruiters)}
        {renderMembers('Hiring managers', team.hiringManagers)}
        {renderMembers('Interviewers', team.interviewers)}
      </div>
    </section>
  )
}
