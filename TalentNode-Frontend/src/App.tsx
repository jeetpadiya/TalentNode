import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './app/layouts/MainLayout'
import OrganizationContextRoutes from './app/routes/OrganizationContextRoutes'
import OrganizationRequiredRoutes from './app/routes/OrganizationRequiredRoutes'
import OrganizationScopedRedirect from './app/routes/OrganizationScopedRedirect'
import ProtectedRoutes from './app/routes/ProtectedRoutes'
import PublicRoutes from './app/routes/PublicRoutes'
import ApplicationsPage from './features/applications/pages/ApplicationsPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import JobSetup from './features/jobs/components/JobSetup'
import CreateOrganizationPage from './features/organization/pages/CreateOrganizationPage'
import OrganizationDetailsPage from './features/organization/pages/OrganizationDetailsPage'

import CandidatesPage from './features/candidates/pages/CandidatesPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import JobsPage from './features/jobs/pages/JobsPage'
import NotFoundPage from './pages/NotFoundPage'
import { OrganizationPage } from './features/organization/pages/OrganizationPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route
              path="/organizations/create"
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
                <Route path="jobs/:jobId/setup" element={<JobSetup />} />
                <Route path="candidates" element={<CandidatesPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
