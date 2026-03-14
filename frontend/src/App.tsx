import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { MainLayout } from './components/layout/MainLayout'
import { AppLayout } from './components/app/AppLayout'
import { AdminGuard } from './components/AdminGuard'
import { LandingPage } from './pages/LandingPage'
import { LessonsPage } from './pages/LessonsPage'
import { TypingPracticePage } from './pages/TypingPracticePage'
import { AdaptivePracticePage } from './pages/AdaptivePracticePage'
import { ReportsPage } from './pages/ReportsPage'
import { ReportPage } from './pages/ReportPage'
import { SessionReportPage } from './pages/SessionReportPage'
import { OverallPerformancePage } from './pages/OverallPerformancePage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <MainLayout>
                  <LoginPage />
                </MainLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <MainLayout>
                  <SignupPage />
                </MainLayout>
              }
            />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="practice" element={<TypingPracticePage />} />
              <Route path="practice/adaptive" element={<AdaptivePracticePage />} />
              <Route path="lessons" element={<LessonsPage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/overall" element={<OverallPerformancePage />} />
              <Route path="reports/:sessionId" element={<SessionReportPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminGuard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route
              path="*"
              element={
                <MainLayout>
                  <NotFoundPage />
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
