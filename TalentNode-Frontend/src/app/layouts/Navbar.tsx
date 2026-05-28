import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import JobPopUp from '../../features/jobs/components/JobPopUp'
import { CiSettings } from "react-icons/ci";
import { canAccessWorkspaceSettings } from '../auth/rbac'
import { getOrganizationById } from '../../features/organization/services/organizationService'
import { Menu, X } from 'lucide-react'


const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-gray-900 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30',
  ].join(' ')

const Navbar = () => {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const logout = useAuthStore((state) => state.logout)
  const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false)
  const [isJobPopUpOpen, setIsJobPopUpOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [activeOrgName, setActiveOrgName] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const shouldHideMainNav =
    location.pathname === '/organizations' ||
    location.pathname === '/organizations/new'
  const { organizationId } = useParams()

  // When inside an organization workspace route, always use the URL org id.
  const organizationBasePath =
    organizationId && organizationId !== 'create'
      ? `/organizations/${organizationId}`
      : user?.organizationId
        ? `/organizations/${user.organizationId}`
        : ''

  const dashboardPath = organizationBasePath
    ? `${organizationBasePath}/dashboard`
    : '/dashboard'
  const canCreateJobs = user?.role === 'admin' || user?.role === 'recruiter'
  const canOpenSettings = canAccessWorkspaceSettings(user?.role)

  const activeOrgId = useMemo(() => {
    if (organizationId && organizationId !== 'create') return organizationId
    if (user?.organizationId) return user.organizationId
    return ''
  }, [organizationId, user?.organizationId])

  useEffect(() => {
    let isMounted = true
    if (!accessToken || !activeOrgId) {
      setActiveOrgName('')
      return
    }

    void (async () => {
      try {
        const res = await getOrganizationById(activeOrgId, accessToken)
        if (!isMounted) return
        setActiveOrgName(res.organization?.name ?? '')
      } catch {
        if (!isMounted) return
        setActiveOrgName('')
      }
    })()

    return () => {
      isMounted = false
    }
  }, [accessToken, activeOrgId])

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  const roleBadgeLabel = user?.role
    ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : ''


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

          {activeOrgName ? (
            <span className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 sm:inline-flex">
              <span className="max-w-[220px] truncate">{activeOrgName}</span>
              {roleBadgeLabel ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                  {roleBadgeLabel}
                </span>
              ) : null}
            </span>
          ) : null}

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
          <nav className="hidden items-center gap-2 sm:flex">
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
          {!shouldHideMainNav && organizationBasePath ? (
            <button
              type="button"
              className="btn btn-ghost sm:hidden"
              aria-label={isMobileNavOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setIsMobileNavOpen((v) => !v)}
            >
              {isMobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          ) : null}
          {user ? (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                [
                  'text-sm font-medium hover:text-gray-900',
                  isActive ? 'text-gray-900' : 'text-gray-600',
                ].join(' ')
              }
              title="View profile"
            >
              {user.username}
            </NavLink>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            Logout
          </button>

          {organizationBasePath && !shouldHideMainNav ? (
            <>
            {canCreateJobs ? (
              <button
                type="button"
                onClick={() => setIsJobPopUpOpen(true)}
                className="btn btn-secondary"
                >
                Create a Job
              </button>
            ) : null}
              {canOpenSettings ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate(`${organizationBasePath}/settings`)}
                  aria-label="Open settings"
                  title="Settings"
                >
                  <CiSettings className="text-xl" />
                </button>
              ) : null}
              </>
          ) : null}
        </div>
      </div>

      {!shouldHideMainNav && organizationBasePath && isMobileNavOpen ? (
        <div className="border-t border-gray-200 bg-white sm:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <NavLink to={dashboardPath} className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to={`${organizationBasePath}/jobs`} className={navLinkClass}>
              Jobs
            </NavLink>
            <NavLink to={`${organizationBasePath}/candidates`} className={navLinkClass}>
              Candidates
            </NavLink>
            <NavLink to={`${organizationBasePath}/applications`} className={navLinkClass}>
              Applications
            </NavLink>
            {canOpenSettings ? (
              <button
                type="button"
                className="btn btn-ghost justify-start"
                onClick={() => navigate(`${organizationBasePath}/settings`)}
              >
                Settings
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}

      <JobPopUp
        isOpen={isJobPopUpOpen}
        onClose={() => setIsJobPopUpOpen(false)}
      />
    </header>
  )
}

export default Navbar
