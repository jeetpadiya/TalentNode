import { Link } from 'react-router-dom'
import { useAuthStore } from '../app/store/AuthStore'

const NotFoundPage = () => {
  const user = useAuthStore((state) => state.user)
  const dashboardPath = user?.organizationId
    ? `/organizations/${user.organizationId}/dashboard`
    : '/dashboard'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Page not found
        </h1>
        <Link
          to={dashboardPath}
          className="mt-6 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
