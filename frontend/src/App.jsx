import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreatePollPage from "./pages/CreatePollPage.jsx";
import PollDetailPage from "./pages/PollDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create-poll" element={<CreatePollPage />} />
                        <Route path="/poll/:id" element={<PollDetailPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
