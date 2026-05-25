import { useEffect, useMemo, useState } from 'react'
import SideBar from '../components/SideBar'
import OrganizationSettingsPage from './OrganizationSettingsPage'
import MessageTemplaePage from './MessageTemplaePage'
import ReviewTemplatePage from './ReviewTemplatePage'
import JobCategoriesPage from './JobCategoriesPage'
import TeamMemberPage from './TeamMemberPage'

import { useAuthStore } from '../../../app/store/AuthStore'
import {
  userPreferencesService,
  type UserPreferences,
} from '../services/userPreferencesService'

const SETTING_TITLES = [
  'User Preferences',
  'Organization',
  'Team',
  'Message Templates',
  'Review Templates',
  'Job Categories',
] as const

const DEFAULT_PREFS: UserPreferences = {
  newCandidateApplication: false,
  newCommentOrReview: false,
  newMessageFromCandidate: false,
}

const SettingPage = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const [userPrefs, setUserPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [isSaving, setIsSaving] = useState(false)

  const activeTitle = useMemo(() => {
    return SETTING_TITLES[activeIndex] ?? 'Settings'
  }, [activeIndex])

  useEffect(() => {
    if (!isAdmin && (activeTitle === 'Organization' || activeTitle === 'Team')) {
      setActiveIndex(0)
      return
    }

    if (activeTitle !== 'User Preferences') return
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
  }, [activeTitle, accessToken, isAdmin])

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="max-w-2xl text-gray-600">
Manage organization preferences, templates, and job categories.

        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SideBar
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          setActiveTab={() => undefined}
          isAdmin={isAdmin}
        />

        <section className="min-h-[520px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-5">
            <p className="text-sm font-medium text-gray-500">Current section</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">{activeTitle}</h2>
          </div>

          {activeTitle === 'User Preferences' ? (

            <form
              className="mt-6"
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
          ) : activeTitle === 'Organization' && isAdmin ? (
            <OrganizationSettingsPage />
          ) : activeTitle === 'Team' && isAdmin ? (
            <TeamMemberPage />
          ) : activeTitle === 'Message Templates' ? (
            <MessageTemplaePage />
          ) : activeTitle === 'Review Templates' ? (
            <ReviewTemplatePage />
          ) : activeTitle === 'Job Categories' ? (
            <JobCategoriesPage />
          ) : (




            <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <h3 className="text-base font-semibold text-gray-900">
                {activeTitle} settings
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                Add the form fields for this settings area here. The navigation is ready
                and follows the same theme as the rest of TalentNode.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default SettingPage

