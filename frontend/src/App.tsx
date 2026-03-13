import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { MainLayout } from './components/layout/MainLayout'
import { LessonsPage } from './pages/LessonsPage'
import { TypingPracticePage } from './pages/TypingPracticePage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LessonsPage />} />
            <Route path="/practice" element={<TypingPracticePage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
