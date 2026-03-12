import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { AnalyticsDashboardPage } from "./pages/AnalyticsDashboardPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { CategoryManagementPage } from "./pages/CategoryManagementPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Protected Pages with Header */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Header />
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/thread/:id"
              element={
                <ProtectedRoute>
                  <Header showSearch={false} />
                  <ThreadDetailPage />
                </ProtectedRoute>
              }
            />
            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
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
              path="/ai-help"
              element={
                <ProtectedRoute>
                  <Header showSearch={false} />
                  <AIHelpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq/:id"
              element={
                <ProtectedRoute>
                  <Header showSearch={false} />
                  <FAQPage />
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
            <Route path="/agent-dashboard" element={<ProtectedRoute requiredRole="agent"><AgentDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><CategoryManagementPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
