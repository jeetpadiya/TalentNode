import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store/AuthStore'
import { createOrganization } from '../services/organizationService'

const CreateOrganizationPage = () => {
  const navigate = useNavigate()
  const accessToken = useAuthStore((state) => state.accessToken)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [allowedDomains, setAllowedDomains] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!accessToken) {
      setError('You need to login first.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await createOrganization(
        {
          name,
          description: description || undefined,
          website: website || undefined,
          allowedDomains: allowedDomains
            .split(',')
            .map((domain) => domain.trim())
            .filter(Boolean),
          logoUrl: logoUrl || undefined,
        },
        accessToken,
      )
      await fetchProfile()
      navigate(`/organizations/${response.organization.id}/dashboard`, {
        replace: true,
      })
    } catch (caughtError) {
      const message =
        typeof caughtError === 'object' &&
        caughtError !== null &&
        'message' in caughtError
          ? String(caughtError.message)
          : 'Could not create organization. Please try again.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create organization
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up your workspace before entering the TalentNode dashboard.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Organization name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Website</span>
            <input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Logo URL</span>
            <input
              type="url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Allowed email domains
          </span>
          <input
            type="text"
            value={allowedDomains}
            onChange={(event) => setAllowedDomains(event.target.value)}
            placeholder="example.com, company.com"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create organization'}
        </button>
      </form>
    </section>
  )
}

export default CreateOrganizationPage
