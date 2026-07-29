import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import CreatePollPage from './pages/CreatePollPage'
import SinglePollPage from './pages/SinglePollPage'
import SettingsPage from './pages/SettingsPage'
import UserProfilePage from './pages/UserProfilePage'
import MyPollsPage from './pages/MyPollsPage'
import VotedPollsPage from './pages/VotedPollsPage'
import BookmarkedPollsPage from './pages/BookmarkedPollsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-zinc-950 text-zinc-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/create-poll" element={<CreatePollPage />} />
              <Route path="/poll/:id" element={<SinglePollPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/my-polls" element={<MyPollsPage />} />
              <Route path="/voted-polls" element={<VotedPollsPage />} />
              <Route path="/bookmarked-polls" element={<BookmarkedPollsPage />} />
              <Route path="/profile/:id" element={<UserProfilePage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
