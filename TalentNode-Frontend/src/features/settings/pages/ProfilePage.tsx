import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getUserProfile, updateUserProfile } from '../../auth/services/authService'
import type { ProfileResponse } from '../../auth/services/authSchemas'

const ProfilePage = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const userFromStore = useAuthStore((s) => s.user)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  const [profile, setProfile] = useState<ProfileResponse['user'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = useMemo(() => true, [])

  useEffect(() => {
    if (!accessToken) return

    // Prefer store value first (fast paint), then verify via API.
    if (userFromStore) {
      setProfile(userFromStore)
      setUsername(userFromStore.username)
      setEmail(userFromStore.email)
    }

    void (async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await getUserProfile(accessToken)
        setProfile(res.user)
        setUsername(res.user.username)
        setEmail(res.user.email)

        // Keep store in sync
        await fetchProfile()
      } catch {
        setError('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="max-w-2xl text-gray-600">
          View and update your account details.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-5">
          <p className="text-sm font-medium text-gray-500">Account</p>
          <p className="mt-1 text-sm text-gray-700">
            Role: <span className="font-medium">{profile?.role ?? '-'}</span>
          </p>
        </div>

        <form
          className="mt-6 space-y-6"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!accessToken) return
            if (!canSave) return

            setIsSaving(true)
            setError(null)
            try {
              const res = await updateUserProfile(accessToken, {
                username,
                email,
              })

              setProfile(res.user)

              // Keep store in sync so other screens reflect latest values
              await fetchProfile()
            } catch (err) {
              setError('Failed to update profile')
            } finally {
              setIsSaving(false)
            }
          }}
        >
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!accessToken || isSaving || !canSave}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              title={!canSave ? 'Backend profile update endpoint not implemented yet.' : undefined}
            >
              {isSaving ? 'Saving...' : 'Update profile'}
            </button>
          </div>

          {!canSave ? (
            <p className="text-xs text-gray-500">
              Profile update is currently not enabled because the backend endpoint
              for updating <span className="font-medium">/users/profile</span> is not
              implemented.
            </p>
          ) : null}
        </form>
      </section>
    </div>
  )
}

export default ProfilePage

