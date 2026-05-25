import { useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '../../../app/store/AuthStore'
import {
  organizationService,
  type Organization,
} from '../services/organizationService'

const {
  getOrganizationById,
  updateOrganization,
} = organizationService


// NOTE: this settings page expects the organization module to expose
// `getOrganizationById` and `updateOrganization`.





type OrgFormState = {
  name: string
  description: string
  website: string
  allowedDomainsText: string
  logoUrl: string
}

const emptyForm: OrgFormState = {
  name: '',
  description: '',
  website: '',
  allowedDomainsText: '',
  logoUrl: '',
}

const joinDomains = (domains: string[]) => domains.join(', ')

const OrganizationSettingsPage = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  // backend uses createdBy ownership, so we only allow editing the user's org
  const organizationId = user?.organizationId

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [form, setForm] = useState<OrgFormState>(emptyForm)


  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialForm = useMemo((): OrgFormState => {
    if (!organization) return emptyForm

    return {
      name: organization.name ?? '',
      description: organization.description ?? '',
      website: organization.website ?? '',
      allowedDomainsText: joinDomains(organization.allowedDomains ?? []),
      logoUrl: organization.logoUrl ?? '',
    }
  }, [organization])

  useEffect(() => {
    if (!accessToken || !organizationId) return

    let isMounted = true

    void (async () => {
      setIsLoading(true)
      setError(null)

      try {
        const resp = await getOrganizationById(
          organizationId,
          accessToken,
        )
        if (!isMounted) return
        setOrganization(resp.organization)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'Failed to load organization')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [accessToken, organizationId])

  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken || !organizationId) return

    setIsSaving(true)
    setError(null)

    try {
      const allowedDomains = form.allowedDomainsText
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)

      const updated = await updateOrganization(
        organizationId,
        accessToken,
        {
          name: form.name,
          description: form.description ? form.description : undefined,
          website: form.website ? form.website : undefined,
          allowedDomains,
          logoUrl: form.logoUrl ? form.logoUrl : undefined,
        },
      )

      setOrganization(updated.organization)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update organization')
    } finally {
      setIsSaving(false)
    }
  }

  if (!organizationId) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <h3 className="text-base font-semibold text-gray-900">
          Organization not set
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
          Your account must be associated with an organization to update organization
          details.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Loading organization...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-6">
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Organization name
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Acme Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-[100px] w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="What does your organization do?"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  value={form.website}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, logoUrl: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Allowed domains (comma separated)
              </label>
              <input
                value={form.allowedDomainsText}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    allowedDomainsText: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="example.com, hiring.example.com"
              />
              <p className="text-xs text-gray-500">
                Used for validating candidate email domains.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={!accessToken || isSaving}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default OrganizationSettingsPage

