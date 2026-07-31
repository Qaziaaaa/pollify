// ===== APP ROOT =====
// Sets up React Router with all page routes.
// Wraps the app in AuthProvider (JWT auth state) and ToastProvider (notification popups).

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
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

// Guards routes that require login — redirects to /login if not authenticated
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for session restore from localStorage
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Guards public-only pages (login/register) — redirects to dashboard if already logged in
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for session restore from localStorage
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// Resolves the landing page based on auth state — auto-login on revisit
function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/create-poll" element={<Protected><CreatePollPage /></Protected>} />
      <Route path="/poll/:id" element={<Protected><SinglePollPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="/my-polls" element={<Protected><MyPollsPage /></Protected>} />
      <Route path="/voted-polls" element={<Protected><VotedPollsPage /></Protected>} />
      <Route path="/bookmarked-polls" element={<Protected><BookmarkedPollsPage /></Protected>} />
      <Route path="/profile/:id" element={<Protected><UserProfilePage /></Protected>} />
      <Route path="/profile" element={<Protected><UserProfilePage /></Protected>} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-zinc-950 text-zinc-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <AppRoutes />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
