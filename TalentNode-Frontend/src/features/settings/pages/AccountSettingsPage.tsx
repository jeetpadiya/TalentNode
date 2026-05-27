import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../../app/store/AuthStore'
import { getUserProfile } from '../../auth/services/authService'
import type { ProfileResponse } from '../../auth/services/authSchemas'

const AccountSettingsPage = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const userFromStore = useAuthStore((s) => s.user)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  const [, setProfile] = useState<ProfileResponse['user'] | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  // Backend update endpoint is not implemented yet.
  const isSaving = false




  const canSave = useMemo(() => {
    // Backend update endpoint for /users/profile is not implemented yet.
    // Keep UI ready but prevent broken API calls.
    return false
  }, [])

  useEffect(() => {
    if (!accessToken) return

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
        await fetchProfile()
      } catch {
        setError('Failed to load account details')
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

return (
  <div className="min-h-screen bg-[#f5f7fb] px-6 py-10">
    <div className="mx-auto max-w-4xl">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#233876]">
          Account Setting
        </h1>
      </div>

      {/* Main Card */}
      <div className="rounded-xl bg-white p-10 shadow-sm">
        <div className="max-w-2xl">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-semibold text-[#233876]">
              Your Profile
            </h2>
          </div>

          {/* Basic Information */}
          <div className="space-y-8">
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-[#233876]">
                Basic Information
              </h3>

              {/* First Name */}
              <div className="mb-6">
                <label className="mb-2 block text-lg font-medium text-[#233876]">
                  First Name
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-14 w-full rounded-md border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-[#233876]"
                />
              </div>

              {/* Last Name */}
              <div className="mb-6">
                <label className="mb-2 block text-lg font-medium text-[#233876]">
                  Last Name
                </label>

                <input
                  type="text"
                  disabled={isLoading}
                  className="h-14 w-full rounded-md border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-[#233876]"
                />
              </div>

              {/* Email */}
              <div className="mb-8">
                <label className="mb-2 block text-lg font-medium text-[#233876]">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-14 w-full rounded-md border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-[#233876]"
                />
              </div>

              {/* Profile Picture */}
              <div>
                <h4 className="mb-3 text-xl font-semibold text-[#233876]">
                  Profile Picture
                </h4>

                <p className="mb-6 text-sm leading-7 text-gray-500">
                  Your picture should be a square image with dimensions of at
                  least 80px. PNG, JPG, and SVG file types are acceptable.
                </p>

                <button
                  type="button"
                  className="rounded-md border border-[#233876] px-6 py-3 text-sm font-medium text-[#233876] transition hover:bg-[#233876] hover:text-white"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {/* Save Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={!accessToken || isSaving || !canSave}
                className="rounded-md bg-[#233876] px-8 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

export default AccountSettingsPage

