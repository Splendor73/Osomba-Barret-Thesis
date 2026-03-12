import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import { useLanguage } from "../context/LanguageContext";
import api from "../lib/api";

export function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: MessageSquare, label: t('agent.unanswered'), path: "/agent-dashboard", badge: null },
    { icon: BarChart3, label: t('nav.analytics'), path: "/admin/analytics", badge: null },
    { icon: Users, label: t('nav.user_management'), path: "/admin/users", badge: null },
    { icon: Settings, label: t('nav.category_management'), path: "/admin/categories", badge: null },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<any>(null);
  const [postsOverTime, setPostsOverTime] = useState<any[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);

  const handleExport = () => {
    const rows = [
      [t('analytics.csv_metric'), t('analytics.csv_value')],
      [t('analytics.total_forum_posts'), overview?.total_posts ?? ""],
      [t('analytics.csv_total_answered'), overview?.total_answered ?? ""],
      [t('analytics.active_faqs'), overview?.total_faqs ?? ""],
      [t('analytics.csv_total_ai_queries'), overview?.total_ai_queries ?? ""],
      [t('analytics.csv_deflection'), overview?.deflection_rate ?? ""],
      [t('analytics.avg_response_time'), overview?.avg_response_time ?? ""],
      [],
      [t('analytics.csv_date'), t('analytics.csv_post_count')],
      ...postsOverTime.map((r: any) => [r.date, r.count]),
      [],
      [t('analytics.csv_category'), t('analytics.thread_count')],
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

  useEffect(() => {
    if (authLoading) return;
    if (role !== "admin") {
      navigate("/");
      return;
    }

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
        setError(t('analytics.load_error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [authLoading, role, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6] relative">
        <aside className="w-64 bg-[#F67C01]/90 backdrop-blur-md text-white flex flex-col p-6">
          <h2 className="text-white">{t('agent.osomba_admin')}</h2>
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

      <aside className="w-64 bg-[#F67C01]/90 backdrop-blur-md text-white flex flex-col z-10">
        <div className="p-6">
          <h2 className="text-white">{t('agent.osomba_admin')}</h2>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mb-1"
          >
            <Home className="w-5 h-5" />
            <span>{t('nav.home')}</span>
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

      <main className="flex-1 overflow-auto z-10">
        <div className="p-8">
          {error && <ErrorMessage message={error} />}

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-gray-900">{t('analytics.title')}</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={!overview}
                className="flex items-center gap-2 px-4 py-2 bg-[#F67C01] text-white rounded-lg hover:bg-[#d56b01] transition-colors shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {t('buttons.export_csv')}
              </button>
            </div>
          </div>

          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">{t('analytics.total_forum_posts')}</p>
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">{overview.total_posts}</p>
                <div className="flex items-center gap-1 text-sm text-[#10B981]">
                  <TrendingUp className="w-4 h-4" />
                  <span>{t('status.all_time')}</span>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">{t('analytics.deflection_rate')}</p>
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">{overview.deflection_rate}%</p>
                <div className="flex items-center gap-1 text-sm text-[#10B981]">
                  <span>{t('analytics.ai_accepted')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 font-medium">{t('analytics.queries_resolved')}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">{t('analytics.avg_response_time')}</p>
                  <BarChart3 className="w-5 h-5 text-[#F67C01]" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">{overview.avg_response_time}</p>
                <p className="text-xs text-gray-500 mt-3 font-medium">{t('analytics.target_time')}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">{t('analytics.active_faqs')}</p>
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <p className="text-3xl text-gray-900 mb-2 font-bold">{overview.total_faqs}</p>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="mb-6 text-gray-900 font-medium">{t('analytics.posts_over_time')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={postsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#F67C01" strokeWidth={3} name={t('analytics.total_posts')} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="mb-6 text-gray-900 font-medium">{t('analytics.category_distribution')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="category" stroke="#6B7280" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#46BB39" radius={[6, 6, 0, 0]} name={t('analytics.thread_count')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
