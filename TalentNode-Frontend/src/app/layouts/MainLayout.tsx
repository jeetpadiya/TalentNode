import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BackButton from '../components/BackButton'
import Breadcrumbs from '../components/Breadcrumbs'

const MainLayout = () => {
  const location = useLocation()

  // Hide back button on dashboard routes, organization list/new, and public pages.
  const isDashboard =
    location.pathname === '/' ||
    location.pathname === '/dashboard' ||
    location.pathname.endsWith('/dashboard')

  const showBack =
    !isDashboard &&
    !['/organizations', '/organizations/new'].includes(location.pathname) &&
    !location.pathname.startsWith('/public/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {showBack ? <BackButton /> : <div />}
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
