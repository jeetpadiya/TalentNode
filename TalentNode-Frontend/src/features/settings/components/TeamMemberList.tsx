import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuthStore } from '../../../app/store/AuthStore'
import ThreeDotPopUp from '../../applications/components/ThreeDotPopUp'
import ActionsMenuDropdown from './ActionsMenuDropdown'
import { organizationTeamService } from '../services/organizationTeamService'

type TeamMemberRole =
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'admin'

type TeamMember = {
  id: string
  username: string | null
  email: string | null
  role: TeamMemberRole | null
}

const ROLE_LABELS: Record<string, string> = {
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  interviewer: 'Interviewer',
  admin: 'Admin',
}

const TeamMemberList = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const currentUserId = useAuthStore((s) => s.user?.id)

  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [memberToDeactivate, setMemberToDeactivate] = useState<TeamMember | null>(
    null,
  )
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>('recruiter')
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)

  const loadTeam = useCallback(async () => {
    if (!accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await organizationTeamService.getOrganizationTeam(accessToken)
      setMembers(res.team)
    } catch {
      setError('Failed to load team members.')
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void loadTeam()
  }, [loadTeam])

  useEffect(() => {
    if (!menuOpenForId) return

    const closeMenu = () => setMenuOpenForId(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [menuOpenForId])

  const rows = useMemo(() => members ?? [], [members])

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accessToken) return

    setIsInviting(true)
    setInviteError(null)
    setInviteMessage(null)
    setActionMessage(null)

    try {
      const res = await organizationTeamService.inviteTeamMember(accessToken, {
        email: inviteEmail,
        role: inviteRole,
      })

      setInviteEmail('')
      setInviteRole('recruiter')
      setInviteMessage(
        `Invite created for ${res.invite.email}. Dev link: ${res.invite.inviteUrl}`,
      )
    } catch (err) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Failed to create invite.'
      setInviteError(message)
    } finally {
      setIsInviting(false)
    }
  }

  const getMemberLabel = (member: TeamMember) =>
    member.username || member.email || 'this member'

  const openDeactivateModal = (member: TeamMember) => {
    if (member.id === currentUserId) return
    setMenuOpenForId(null)
    setActionError(null)
    setMemberToDeactivate(member)
  }

  const closeDeactivateModal = () => {
    if (isDeactivating) return
    setMemberToDeactivate(null)
  }

  const confirmDeactivate = async () => {
    if (!accessToken || !memberToDeactivate) return
    if (memberToDeactivate.id === currentUserId) return

    const label = getMemberLabel(memberToDeactivate)
    setIsDeactivating(true)
    setActionMessage(null)
    setActionError(null)

    try {
      await organizationTeamService.deactivateTeamMember(
        accessToken,
        memberToDeactivate.id,
      )
      setMembers((prev) =>
        prev.filter((m) => m.id !== memberToDeactivate.id),
      )
      setActionMessage(`${label} was deactivated from the team.`)
      setMemberToDeactivate(null)
    } catch (err) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Failed to deactivate team member.'
      setActionError(message)
    } finally {
      setIsDeactivating(false)
    }
  }

  const canShowActions = (memberId: string) =>
    memberId !== currentUserId && !isDeactivating

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">Team members</h3>
      </div>

      <form
        onSubmit={handleInvite}
        className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
      >
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
            Email
          </span>
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
            placeholder="teammate@company.com"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
            Role
          </span>
          <select
            value={inviteRole}
            onChange={(event) =>
              setInviteRole(event.target.value as TeamMemberRole)
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900"
          >
            <option value="recruiter">Recruiter</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="interviewer">Interviewer</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isInviting || !accessToken}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {isInviting ? 'Sending...' : 'Send invite'}
          </button>
        </div>
      </form>

      {inviteMessage ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {inviteMessage}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {actionMessage}
        </div>
      ) : null}

      {inviteError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {inviteError}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="overflow-visible rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[1.2fr_1.6fr_1fr_0.7fr] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
          <div>Username</div>
          <div>Email</div>
          <div>Role</div>
          <div className="text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="px-4 py-10 text-sm text-gray-600">Loading…</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-sm text-gray-600">
            No team members yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rows.map((m) => {
              const role = m.role ?? 'recruiter'
              const roleLabel = ROLE_LABELS[role] ?? role
              const menuId = `team_menu_${m.id}`
              const isMenuOpen = menuOpenForId === m.id
              const showActions = canShowActions(m.id)

              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[1.2fr_1.6fr_1fr_0.7fr] items-center gap-4 px-4 py-3 text-sm"
                >
                  <div className="text-gray-900">
                    {m.username ?? <span className="text-gray-400">—</span>}
                  </div>
                  <div className="text-gray-900">
                    {m.email ?? <span className="text-gray-400">—</span>}
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      {roleLabel}
                    </span>
                  </div>
                  <div className="flex justify-end overflow-visible">
                    {showActions ? (
                      <ActionsMenuDropdown
                        isOpen={isMenuOpen}
                        menuId={menuId}
                        ariaLabel={`Actions for ${m.username ?? m.email ?? 'team member'}`}
                        onToggle={() =>
                          setMenuOpenForId((curr) =>
                            curr === m.id ? null : m.id,
                          )
                        }
                      >
                        <ThreeDotPopUp
                          firstmenutext="Deactivate from team"
                          showSecondMenu={false}
                          onFirstClick={() => openDeactivateModal(m)}
                        />
                      </ActionsMenuDropdown>
                    ) : m.id === currentUserId ? (
                      <span className="text-xs text-gray-400">You</span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {memberToDeactivate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-team-member-title"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3
              id="deactivate-team-member-title"
              className="text-lg font-semibold text-gray-900"
            >
              Deactivate from team?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {getMemberLabel(memberToDeactivate)}
              </span>
              {memberToDeactivate.email &&
              memberToDeactivate.username &&
              memberToDeactivate.email !== memberToDeactivate.username ? (
                <>
                  {' '}
                  <span className="text-gray-500">
                    ({memberToDeactivate.email})
                  </span>
                </>
              ) : null}{' '}
              will lose access to this organization. You can invite them again
              later if needed.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeactivateModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeactivate()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={!accessToken || isDeactivating}
              >
                {isDeactivating ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default TeamMemberList
