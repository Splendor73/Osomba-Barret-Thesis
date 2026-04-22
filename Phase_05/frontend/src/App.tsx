import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { ThreadDetailPage } from "./pages/ThreadDetailPage";
import { PostQuestionPage } from "./pages/PostQuestionPage";
import { AIHelpPage } from "./pages/AIHelpPage";
import { AgentDashboardPage } from "./pages/AgentDashboardPage";
import { FAQPage } from "./pages/FAQPage";
import { EditFAQPage } from "./pages/EditFAQPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { CategoryManagementPage } from "./pages/CategoryManagementPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ContactUsPage } from "./pages/ContactUsPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Pages with Header */}
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <HomePage />
                </>
              }
            />
            <Route
              path="/thread/:id"
              element={
                <>
                  <Header showSearch={false} />
                  <ThreadDetailPage />
                </>
              }
            />
            <Route
              path="/ai-help"
              element={
                <>
                  <Header showSearch={false} />
                  <AIHelpPage />
                </>
              }
            />
            <Route
              path="/faq/:id"
              element={
                <>
                  <Header showSearch={false} />
                  <FAQPage />
                </>
              }
            />
            <Route
              path="/contact-us"
              element={
                <>
                  <Header showSearch={false} />
                  <ContactUsPage />
                </>
              }
            />

            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Pages */}
            <Route
              path="/post"
              element={
                <ProtectedRoute>
                  <Header showSearch={false} minimal />
                  <PostQuestionPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Header showSearch={false} />
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Agent/Admin Pages without Header */}
            <Route path="/dashboard" element={<ProtectedRoute anyAgentOrAdmin={true}><AgentDashboardPage /></ProtectedRoute>} />
            <Route
              path="/agent-dashboard"
              element={
                <ProtectedRoute anyAgentOrAdmin={true}>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Navigate to="/dashboard?tab=analytics" replace />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><CategoryManagementPage /></ProtectedRoute>} />
            <Route path="/admin/faq/:id/edit" element={<ProtectedRoute anyAgentOrAdmin={true}><Header showSearch={false} /><EditFAQPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
