import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminLayout } from './layouts/AdminLayout'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AnalyticsPage } from './pages/admin/AnalyticsPage'
import { ApprovedSchoolsPage } from './pages/admin/ApprovedSchoolsPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { SchoolApprovalPage } from './pages/admin/SchoolApprovalPage'
import { ApprovalWaitingPage } from './pages/ApprovalWaitingPage'
import { LandingPage } from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { RegistrationFormPage } from './pages/RegistrationFormPage'
import { RoleDashboardPage } from './pages/RoleDashboardPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<LandingPage />} path="/" />
          <Route element={<AdminLoginPage />} path="/login" />
          <Route element={<Navigate replace to="/login" />} path="/admin/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<RegistrationFormPage />} path="/register/:type" />
          <Route element={<ApprovalWaitingPage />} path="/approval-waiting/:schoolId" />
          <Route element={<ProtectedRoute allowedRoles={['websiteAdmin']} />}>
            <Route element={<AdminLayout />}>
              <Route
                element={<Navigate replace to="/admin/dashboard" />}
                path="/admin"
              />
              <Route element={<DashboardPage />} path="/admin/dashboard" />
              <Route
                element={<SchoolApprovalPage />}
                path="/admin/approval-requests"
              />
              <Route
                element={<ApprovedSchoolsPage />}
                path="/admin/approved-schools"
              />
              <Route element={<AnalyticsPage />} path="/admin/analytics" />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['school']} />}>
            <Route
              element={<RoleDashboardPage role="school" />}
              path="/school/dashboard"
            />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route
              element={<RoleDashboardPage role="teacher" />}
              path="/teacher/dashboard"
            />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route
              element={<RoleDashboardPage role="student" />}
              path="/student/dashboard"
            />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
