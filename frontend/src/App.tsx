import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { MainLayout } from './components/layout/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LessonsPage } from './pages/LessonsPage'
import { TypingPracticePage } from './pages/TypingPracticePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<LessonsPage />} />
              <Route path="/practice" element={<TypingPracticePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
