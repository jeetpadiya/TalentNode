import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

import MainLayout from './app/layouts/MainLayout'
import OrganizationContextRoutes from './app/routes/OrganizationContextRoutes'
import OrganizationRequiredRoutes from './app/routes/OrganizationRequiredRoutes'
import OrganizationScopedRedirect from './app/routes/OrganizationScopedRedirect'
import ProtectedRoutes from './app/routes/ProtectedRoutes'
import PublicRoutes from './app/routes/PublicRoutes'
import RequireRole from './app/routes/RequireRole'
import PageLoader from './components/common/PageLoader'
import { useSessionExpiryMonitor } from './hooks/useSessionExpiryMonitor'

// ----------------------------------------------------------------------------
// LAZY LOADED ROUTE COMPONENTS (CODE SPLITTING)
// ----------------------------------------------------------------------------

// Public & Authentication
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'))
const PublicJobsPage = lazy(() => import('./features/public/pages/PublicJobsPage'))
const PublicJobApplyPage = lazy(() => import('./features/public/pages/PublicJobApplyPage'))

// Error Pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'))

// User Profile & Account Settings
const ProfilePage = lazy(() => import('./features/settings/pages/ProfilePage'))
const AccountSettingsPage = lazy(() => import('./features/settings/pages/AccountSettingsPage'))
const AcceptInvitePage = lazy(() => import('./features/settings/pages/AcceptInvitePage'))

// Organization Management
const CreateOrganizationPage = lazy(() => import('./features/organization/pages/CreateOrganizationPage'))
const OrganizationPage = lazy(() => import('./features/organization/pages/OrganizationPage'))
const OrganizationDetailsPage = lazy(() => import('./features/organization/pages/OrganizationDetailsPage'))

// Core Application Features
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const JobsPage = lazy(() => import('./features/jobs/pages/JobsPage'))
const JobSetupPage = lazy(() => import('./features/jobs/pages/JobSetupPage'))
const JobApplicationFormPage = lazy(() => import('./features/jobs/pages/JobApplicationFormPage'))
const JobHiringStagesPage = lazy(() => import('./features/jobs/pages/JobHiringStagesPage'))
const JobHiringTeamPage = lazy(() => import('./features/jobs/pages/JobHiringTeamPage'))
const CandidatesPage = lazy(() => import('./features/candidates/pages/CandidatesPage'))
const ApplicationsPage = lazy(() => import('./features/applications/pages/ApplicationsPage'))
const SettingPage = lazy(() => import('./features/settings/pages/SettingPage'))
const UserPreferencesPage = lazy(() => import('./features/settings/pages/UserPreferencesPage'))

const App = () => {
  useSessionExpiryMonitor()

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" closeButton />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<PublicRoutes />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/public/:slug/jobs" element={<PublicJobsPage />} />
            <Route path="/public/jobs/:jobId" element={<PublicJobApplyPage />} />
            <Route path="/public/jobs/:jobId/apply" element={<PublicJobApplyPage />} />

            <Route path="/forbidden" element={<ForbiddenPage />} />

            <Route element={<ProtectedRoutes />}>
              <Route element={<MainLayout />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/account-settings" element={<AccountSettingsPage />} />
              </Route>

              <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

              <Route element={<MainLayout />}>
                <Route path="/organizations/new" element={<CreateOrganizationPage />} />
              </Route>

              <Route element={<OrganizationRequiredRoutes />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<OrganizationScopedRedirect page="dashboard" />} />
                  <Route path="/dashboard" element={<OrganizationScopedRedirect page="dashboard" />} />
                  <Route path="/jobs" element={<OrganizationScopedRedirect page="jobs" />} />
                  <Route path="/candidates" element={<OrganizationScopedRedirect page="candidates" />} />
                  <Route path="/applications" element={<OrganizationScopedRedirect page="applications" />} />
                  <Route path="/organizations" element={<OrganizationPage />} />

                  <Route path="/organizations/:organizationId" element={<OrganizationContextRoutes />}>
                    <Route index element={<OrganizationDetailsPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="jobs" element={<JobsPage />} />

                    {/* Recruiting management (admin/recruiter only) */}
                    <Route element={<RequireRole allowed={['admin', 'recruiter']} />}>
                      <Route path="jobs/:jobId/setup" element={<JobSetupPage />} />
                      <Route path="jobs/:jobId/application-form" element={<JobApplicationFormPage />} />
                      <Route path="jobs/:jobId/hiring-stages" element={<JobHiringStagesPage />} />
                      <Route path="jobs/:jobId/hiring-team" element={<JobHiringTeamPage />} />
                      <Route path="settings" element={<SettingPage />} />
                    </Route>

                    <Route path="candidates" element={<CandidatesPage />} />
                    <Route path="applications" element={<ApplicationsPage />} />
                    <Route path="applications/:applicationId" element={<ApplicationsPage />} />

                    {/* Everyone can update their own preferences */}
                    <Route
                      element={
                        <RequireRole
                          allowed={[
                            'admin',
                            'recruiter',
                            'hiring_manager',
                            'interviewer',
                            'candidate',
                          ]}
                        />
                      }
                    >
                      <Route path="settings/user-preferences" element={<UserPreferencesPage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
