import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { ThreadDetailPage } from "./pages/ThreadDetailPage";
import { PostQuestionPage } from "./pages/PostQuestionPage";
import { AIHelpPage } from "./pages/AIHelpPage";
import { AgentDashboardPage } from "./pages/AgentDashboardPage";
import { FAQPage } from "./pages/FAQPage";
import { AnalyticsDashboardPage } from "./pages/AnalyticsDashboardPage";

export default function App() {
  return (
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
        <Route
          path="/post"
          element={
            <>
              <Header showSearch={false} minimal />
              <PostQuestionPage />
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
        
        {/* Agent/Admin Pages without Header */}
        <Route path="/agent" element={<AgentDashboardPage />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboardPage />} />
      </Routes>
    </Router>
  );
}
