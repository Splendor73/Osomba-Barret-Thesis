import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
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