import { useEffect, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import {
  userPreferencesService,
  type UserPreferences,
} from '../services/userPreferencesService'

const DEFAULT_PREFS: UserPreferences = {
  newCandidateApplication: false,
  newCommentOrReview: false,
  newMessageFromCandidate: false,
}

const UserPreferencesPage = () => {
  const accessToken = useAuthStore((s) => s.accessToken)

  const [userPrefs, setUserPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!accessToken) return

    void (async () => {
      try {
        const prefs = await userPreferencesService.getUserPreferences(
          accessToken,
        )
        setUserPrefs(prefs)
      } catch {
        setUserPrefs(DEFAULT_PREFS)
      }
    })()
  }, [accessToken])

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          User Preferences
        </h1>
        <p className="max-w-2xl text-gray-600">
          Control notifications for new applications, comments/reviews, and
          candidate messages.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!accessToken) return

            setIsSaving(true)
            try {
              const updated = await userPreferencesService.updateUserPreferences(
                accessToken,
                userPrefs,
              )
              setUserPrefs(updated)
            } finally {
              setIsSaving(false)
            }
          }}
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-5">
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={userPrefs.newCandidateApplication}
                  onChange={(e) =>
                    setUserPrefs((p) => ({
                      ...p,
                      newCandidateApplication: e.target.checked,
                    }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    New candidate application
                  </span>
                  <span className="block text-xs text-gray-600">
                    Notify when a new candidate applies.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={userPrefs.newCommentOrReview}
                  onChange={(e) =>
                    setUserPrefs((p) => ({
                      ...p,
                      newCommentOrReview: e.target.checked,
                    }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    New comment or review
                  </span>
                  <span className="block text-xs text-gray-600">
                    Notify when new feedback is added.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={userPrefs.newMessageFromCandidate}
                  onChange={(e) =>
                    setUserPrefs((p) => ({
                      ...p,
                      newMessageFromCandidate: e.target.checked,
                    }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    New message from a candidate
                  </span>
                  <span className="block text-xs text-gray-600">
                    Notify when a candidate sends a message.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={!accessToken || isSaving}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save preferences'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}

export default UserPreferencesPage

