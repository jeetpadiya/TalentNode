import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BackButton from '../components/BackButton'
import Breadcrumbs from '../components/Breadcrumbs'

const MainLayout = () => {
  const location = useLocation()

  // Show back button on "deep" workspace pages.
  const showBack =
    !['/dashboard', '/organizations', '/organizations/new'].includes(location.pathname) &&
    !location.pathname.startsWith('/public/')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {showBack ? (
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <BackButton />
            <Breadcrumbs />
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
