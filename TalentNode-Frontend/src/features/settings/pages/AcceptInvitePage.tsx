import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { organizationTeamService } from '../services/organizationTeamService'

const getOrganizationName = (
  organization: { name?: string } | string | null | undefined,
) => {
  if (!organization || typeof organization === 'string') return 'this organization'
  return organization.name ?? 'this organization'
}

const AcceptInvitePage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const logout = useAuthStore((state) => state.logout)

  const [title, setTitle] = useState('Checking invite...')
  const [message, setMessage] = useState('Please wait while we verify the link.')
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const isWrongAccount =
    Boolean(user?.email && invitedEmail) &&
    user?.email.toLowerCase() !== invitedEmail?.toLowerCase()

  useEffect(() => {
    if (!token) {
      setTitle('Invite link is missing')
      setMessage('Open the invite link from your email and try again.')
      return
    }

    void (async () => {
      try {
        const preview = await organizationTeamService.getInvitePreview(token)
        setInvitedEmail(preview.invite.email)
        setTitle(`Join ${getOrganizationName(preview.invite.organization)}`)
        setMessage(`This invite was sent to ${preview.invite.email}.`)
      } catch (err) {
        const nextMessage =
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message?: string }).message)
            : 'This invite link is invalid or expired.'
        setTitle('Invite unavailable')
        setMessage(nextMessage)
      }
    })()
  }, [token])

  const handleAccept = async () => {
    if (!token || !accessToken) return
    if (isWrongAccount) return

    setIsAccepting(true)
    try {
      const res = await organizationTeamService.acceptInvite(accessToken, token)
      await fetchProfile()
      const organizationId = res.organization?.id
      navigate(
        organizationId ? `/organizations/${organizationId}/dashboard` : '/organizations',
        { replace: true },
      )
    } catch (err) {
      const nextMessage =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Could not accept this invite.'
      setTitle('Could not accept invite')
      setMessage(nextMessage)
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        {isWrongAccount ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You are logged in as {user?.email}. Log out and sign in with{' '}
            {invitedEmail} to accept this invite.
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAccept}
            disabled={!accessToken || isAccepting || !token || isWrongAccount}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAccepting ? 'Accepting...' : 'Accept invite'}
          </button>

          {!accessToken ? (
            <Link
              to="/login"
              state={{ from: { pathname: `/accept-invite/${token ?? ''}` } }}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Login first
            </Link>
          ) : null}

          {isWrongAccount ? (
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', {
                  state: { from: { pathname: `/accept-invite/${token ?? ''}` } },
                })
              }}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Log out
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default AcceptInvitePage
