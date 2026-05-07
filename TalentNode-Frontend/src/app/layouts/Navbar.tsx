import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import JobPopUp from '../../features/jobs/components/JobPopUp'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ')

const Navbar = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false)
  const [isJobPopUpOpen, setIsJobPopUpOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const shouldHideMainNav =
    location.pathname === '/organizations' ||
    location.pathname === '/organizations/create'
  const organizationIdFromPath = location.pathname.match(
    /^\/organizations\/([^/]+)/,
  )?.[1]
  const currentOrganizationId =
    organizationIdFromPath === 'create'
      ? user?.organizationId
      : organizationIdFromPath ?? user?.organizationId
  const organizationBasePath = currentOrganizationId
    ? `/organizations/${currentOrganizationId}`
    : ''
  const dashboardPath = organizationBasePath
    ? `${organizationBasePath}/dashboard`
    : '/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleOrganizationClick = () => {
    setIsOrganizationMenuOpen(false)
    navigate('/organizations')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <NavLink
            to={dashboardPath}
            className="text-xl font-bold text-gray-900"
          >
            TalentNode
          </NavLink>

          <div className="relative">
            <button
              type="button"
              aria-label="Open workspace menu"
              aria-expanded={isOrganizationMenuOpen}
              onClick={() =>
                setIsOrganizationMenuOpen((isOpen) => !isOpen)
              }
              className="rounded-md px-2 py-1 text-lg font-semibold leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              ⋮
            </button>

            {isOrganizationMenuOpen ? (
              <div className="absolute left-0 top-9 z-10 w-52 rounded-md border border-gray-200 bg-white py-2 shadow-lg">
                <button
                  type="button"
                  onClick={handleOrganizationClick}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Your organization
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {!shouldHideMainNav ? (
          <nav className="flex items-center gap-2">
            <NavLink to={dashboardPath} className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to={`${organizationBasePath}/jobs`} className={navLinkClass}>
              Jobs
            </NavLink>
            <NavLink
              to={
                organizationBasePath
                  ? `${organizationBasePath}/candidates`
                  : '/candidates'
              }
              className={navLinkClass}
            >
              Candidates
            </NavLink>
            <NavLink
              to={
                organizationBasePath
                  ? `${organizationBasePath}/applications`
                  : '/applications'
              }
              className={navLinkClass}
            >
              Applications
            </NavLink>
          </nav>
        ) : null}

        <div className="flex items-center gap-3">
          {user ? (
            <span className="text-sm text-gray-600">{user.username}</span>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>

          {organizationBasePath && !shouldHideMainNav ? (
            <button
              type="button"
              onClick={() => setIsJobPopUpOpen(true)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Create a Job
            </button>
          ) : null}
        </div>
      </div>
      <JobPopUp
        isOpen={isJobPopUpOpen}
        onClose={() => setIsJobPopUpOpen(false)}
      />
    </header>
  )
}

export default Navbar
