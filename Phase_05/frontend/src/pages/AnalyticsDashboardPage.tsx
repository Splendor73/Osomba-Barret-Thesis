import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  Download,
  TrendingUp,
  CheckCircle,
  Users,
  Settings,
  Home,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrganicBackground } from "../components/OrganicBackground";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent-dashboard", badge: null },
  { icon: MessageSquare, label: "Unanswered", path: "/agent-dashboard", badge: null }, // Dynamic badge handled in Agent page
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", badge: null },
  { icon: Users, label: "User Management", path: "/admin/users", badge: null },
  { icon: Settings, label: "Categories", path: "/admin/categories", badge: null },
];

export function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<any>(null);
  const [postsOverTime, setPostsOverTime] = useState<any[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (role !== "admin") {
      navigate("/"); // Only admins can view analytics
      return;
    }

    const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Forum Posts", overview?.total_posts ?? ""],
      ["Total Answered", overview?.total_answered ?? ""],
      ["Active FAQs", overview?.total_faqs ?? ""],
      ["Total AI Queries", overview?.total_ai_queries ?? ""],
      ["Deflection Rate (%)", overview?.deflection_rate ?? ""],
      ["Avg Response Time", overview?.avg_response_time ?? ""],
      [],
      ["Date", "Post Count"],
      ...postsOverTime.map((r: any) => [r.date, r.count]),
      [],
      ["Category", "Thread Count"],
      ...categoryDist.map((r: any) => [r.category, r.count]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osomba-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchAnalytics = async () => {
      try {
        const [overviewRes, postsRes, categoryRes] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/posts-over-time"),
          api.get("/admin/analytics/category-distribution"),
        ]);

        setOverview(overviewRes.data);
        setPostsOverTime(postsRes.data);
        setCategoryDist(categoryRes.data);
      } catch (err: any) {
        console.error("Failed to load analytics:", err);
        setError("Failed to load analytics dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [authLoading, role, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6] relative">
        <aside className="w-64 bg-gradient-to-b from-[#F67C01]/80 via-[#F89C4A]/80 to-[#46BB39]/80 backdrop-blur-md text-white flex flex-col p-6">
          <h2 className="text-white">Osomba Admin</h2>
        </aside>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] relative">
      <OrganicBackground variant="dashboard" />

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#F67C01]/90 via-[#F89C4A]/90 to-[#46BB39]/90 backdrop-blur-md text-white flex flex-col z-10">
        <div className="p-6">
          <h2 className="text-white">Osomba Admin</h2>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mb-1"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin/analytics";
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-white transition-colors mb-1 ${
                  isActive ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={user?.avatar || "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop"}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">{user?.name || user?.full_name || "Admin User"}</p>
              <p className="text-orange-100 text-xs uppercase">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto z-10">
        <div className="p-8">
          {error && <ErrorMessage message={error} />}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-gray-900">Analytics Dashboard</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={!overview}
                className="flex items-center gap-2 px-4 py-2 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Forum Posts */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">Total Forum Posts</p>
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">
                  {overview.total_posts}
                </p>
                <div className="flex items-center gap-1 text-sm text-[#10B981]">
                  <TrendingUp className="w-4 h-4" />
                  <span>All time</span>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              {/* Deflection Rate */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">Deflection Rate</p>
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">
                  {overview.deflection_rate}%
                </p>
                <div className="flex items-center gap-1 text-sm text-[#10B981]">
                  <span>AI answers successfully accepted</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 font-medium">Queries resolved without new post</p>
              </div>

              {/* Avg Response Time */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">Avg Response Time</p>
                  <BarChart3 className="w-5 h-5 text-[#F67C01]" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">
                  {overview.avg_response_time}
                </p>
                <p className="text-xs text-gray-500 mt-3 font-medium">Target: {"<"} 6 hours</p>
              </div>

              {/* FAQ Setup */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">Active FAQs</p>
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">
                  {overview.total_faqs}
                </p>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Posts Over Time */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="mb-6 text-gray-900 font-medium">Posts Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={postsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#F67C01" strokeWidth={3} name="Total Posts" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="mb-6 text-gray-900 font-medium">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="category" stroke="#6B7280" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#46BB39" radius={[6, 6, 0, 0]} name="Thread Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}