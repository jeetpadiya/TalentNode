import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import MainLayout from './app/layouts/MainLayout'
import OrganizationContextRoutes from './app/routes/OrganizationContextRoutes'
import OrganizationRequiredRoutes from './app/routes/OrganizationRequiredRoutes'
import OrganizationScopedRedirect from './app/routes/OrganizationScopedRedirect'
import ProtectedRoutes from './app/routes/ProtectedRoutes'
import PublicRoutes from './app/routes/PublicRoutes'
import RequireRole from './app/routes/RequireRole'
import ApplicationsPage from './features/applications/pages/ApplicationsPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import JobApplicationFormPage from './features/jobs/pages/JobApplicationFormPage'
import JobHiringStagesPage from './features/jobs/pages/JobHiringStagesPage'
import JobHiringTeamPage from './features/jobs/pages/JobHiringTeamPage'
import JobSetupPage from './features/jobs/pages/JobSetupPage'
import CreateOrganizationPage from './features/organization/pages/CreateOrganizationPage'
import OrganizationDetailsPage from './features/organization/pages/OrganizationDetailsPage'

import PublicJobsPage from './features/public/pages/PublicJobsPage'
import PublicJobApplyPage from './features/public/pages/PublicJobApplyPage'


import CandidatesPage from './features/candidates/pages/CandidatesPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import JobsPage from './features/jobs/pages/JobsPage'
import NotFoundPage from './pages/NotFoundPage'
import ForbiddenPage from './pages/ForbiddenPage'
import { OrganizationPage } from './features/organization/pages/OrganizationPage'
import SettingPage from './features/settings/pages/SettingPage'
import UserPreferencesPage from './features/settings/pages/UserPreferencesPage'
import AcceptInvitePage from './features/settings/pages/AcceptInvitePage'
import ProfilePage from './features/settings/pages/ProfilePage'
import AccountSettingsPage from './features/settings/pages/AccountSettingsPage'


const App = () => {
  return (
    <>
      <Toaster richColors position="top-right" closeButton />
      <BrowserRouter>
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
            <Route
              path="/organizations/new"
              element={<CreateOrganizationPage />}
            />
          </Route>

          <Route element={<OrganizationRequiredRoutes />}>
            <Route element={<MainLayout />}>
              <Route
                path="/"
                element={<OrganizationScopedRedirect page="dashboard" />}
              />
              <Route
                path="/dashboard"
                element={<OrganizationScopedRedirect page="dashboard" />}
              />
              <Route
                path="/jobs"
                element={<OrganizationScopedRedirect page="jobs" />}
              />
              <Route
                path="/candidates"
                element={<OrganizationScopedRedirect page="candidates" />}
              />
              <Route
                path="/applications"
                element={<OrganizationScopedRedirect page="applications" />}
              />
              <Route path="/organizations" element={<OrganizationPage />} />
              <Route
                path="/organizations/:organizationId"
                element={<OrganizationContextRoutes />}
              >
                <Route index element={<OrganizationDetailsPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="jobs" element={<JobsPage />} />

                {/* Recruiting management (admin/recruiter only) */}
                <Route element={<RequireRole allowed={['admin', 'recruiter']} />}>
                  <Route path="jobs/:jobId/setup" element={<JobSetupPage />} />
                  <Route
                    path="jobs/:jobId/application-form"
                    element={<JobApplicationFormPage />}
                  />
                  <Route
                    path="jobs/:jobId/hiring-stages"
                    element={<JobHiringStagesPage />}
                  />
                  <Route
                    path="jobs/:jobId/hiring-team"
                    element={<JobHiringTeamPage />}
                  />
                  <Route path="settings" element={<SettingPage />} />
                </Route>

                <Route path="candidates" element={<CandidatesPage />} />
                {/* <Route path="candidates/:candidateId" element={<CandidatesPage />} /> */}
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
                  <Route
                    path="settings/user-preferences"
                    element={<UserPreferencesPage />}
                  />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
