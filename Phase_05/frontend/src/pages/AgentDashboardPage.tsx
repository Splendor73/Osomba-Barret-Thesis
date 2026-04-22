import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  BarChart3,
  Download,
  Search,
  Flag,
  CheckCircle,
  Users,
  Settings,
  FileText,
  Home,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CategoryBadge } from "../components/CategoryBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ThreadTableSkeleton } from "../components/SkeletonLoader";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../lib/api";

interface Topic {
  id: number;
  title: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  author_name: string;
  author_avatar: string;
  status: string;
  is_locked: boolean;
  view_count: number;
  created_at: string;
}

interface ReportItem {
  id: number;
  reporter_email: string;
  topic_id: number | null;
  post_id: number | null;
  content_type: "topic" | "post" | null;
  content_author_id: number | null;
  content_author_email: string | null;
  content_author_blocked: boolean;
  content_deleted: boolean;
  reason: string;
  status: string;
  target_content: string;
  created_at: string;
}

interface InvestigatedUser {
  user_id: number;
  email: string;
  full_name: string | null;
  user_name: string | null;
  is_blocked: boolean;
  support_role: string;
}

interface InvestigatedActivity {
  user: InvestigatedUser;
  topics: Array<{
    id: number;
    title: string;
    content: string;
    is_deleted: boolean;
    created_at: string;
  }>;
  posts: Array<{
    id: number;
    topic_id: number;
    content: string;
    is_deleted: boolean;
    is_accepted_answer: boolean;
    created_at: string;
  }>;
}

type DashboardTab = "threads" | "reports" | "users" | "analytics";

export function AgentDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const initialTab: DashboardTab =
    role === "admin" && searchParams.get("tab") === "analytics" ? "analytics" : "threads";
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("last7");
  const [sortBy, setSortBy] = useState("newest");
  const [reportStatusFilter, setReportStatusFilter] = useState<"pending" | "handled" | "all">("pending");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<InvestigatedUser[]>([]);
  const [selectedUserActivity, setSelectedUserActivity] = useState<InvestigatedActivity | null>(null);
  const [investigationLoading, setInvestigationLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [postsOverTime, setPostsOverTime] = useState<any[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const activeSectionLabel =
    activeTab === "threads" ? t('agent.unanswered_threads') :
    activeTab === "analytics" ? t('analytics.title') :
    activeTab === "reports" ? "Reported Content" :
    "User Review";

  useEffect(() => {
    if (authLoading) return;
    if (role !== "agent" && role !== "admin") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const requests: Promise<any>[] = [
          api.get("/support/topics?limit=100"),
          api.get("/support/categories/"),
          api.get("/admin/reports").catch(() => ({ data: [] })),
        ];
        if (role === "admin") {
          requests.push(
            api.get("/admin/analytics/overview"),
            api.get("/admin/analytics/posts-over-time"),
            api.get("/admin/analytics/category-distribution")
          );
        }

        const [topicsRes, catsRes, reportsRes, overviewRes, postsRes, categoryRes] = await Promise.all(requests);
        setTopics(topicsRes.data);
        setCategoryNames(catsRes.data.map((c: any) => c.name_en || c.name));
        setReports(reportsRes.data);
        if (role === "admin") {
          setOverview(overviewRes.data);
          setPostsOverTime(postsRes.data);
          setCategoryDist(categoryRes.data);
        }
      } catch (err: any) {
        console.error("Agent dashboard error:", err);
        setError(t('agent.load_error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authLoading, role, navigate, t]);

  useEffect(() => {
    if (activeTab === "users" && userSearchResults.length === 0 && !investigationLoading) {
      searchUsersForInvestigation();
    }
  }, [activeTab]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (role === "admin" && requestedTab === "analytics" && activeTab !== "analytics") {
      setActiveTab("analytics");
    }
    if (requestedTab !== "analytics" && activeTab === "analytics") {
      setActiveTab("threads");
    }
  }, [searchParams, role, activeTab]);

  const setDashboardTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "analytics" && role === "admin") nextParams.set("tab", "analytics");
    else nextParams.delete("tab");
    setSearchParams(nextParams, { replace: true });
  };

  const filteredTopics = topics.filter((thread) => {
    if (categoryFilter !== "All" && thread.category_name !== categoryFilter) return false;
    if (searchQuery && !thread.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateFilter !== "all") {
      const daysAgo = dateFilter === "last7" ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysAgo);
      if (new Date(thread.created_at) < cutoff) return false;
    }
    return true;
  });

  const filteredOpenThreads = filteredTopics
    .filter((thread) => thread.status !== "Answered")
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    });

  const filteredAnsweredThreads = filteredTopics.filter((thread) => thread.status === "Answered");
  const pendingReportCount = reports.filter((report) => report.status === "PENDING").length;
  const handledReportCount = reports.filter((report) => report.status !== "PENDING").length;
  const filteredReports = reports
    .filter((report) => {
      if (reportStatusFilter === "pending" && report.status !== "PENDING") return false;
      if (reportStatusFilter === "handled" && report.status === "PENDING") return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          report.reporter_email.toLowerCase().includes(query) ||
          (report.content_author_email || "").toLowerCase().includes(query) ||
          report.reason.toLowerCase().includes(query) ||
          report.target_content.toLowerCase().includes(query) ||
          report.status.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (dateFilter !== "all") {
        const daysAgo = dateFilter === "last7" ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysAgo);
        if (new Date(report.created_at) < cutoff) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    });
  const hasActiveFilters = categoryFilter !== "All" || dateFilter !== "all" || searchQuery.trim().length > 0;

  const filteredThreads = filteredOpenThreads;

  const totalVisibleTopics = filteredTopics.length;

  const statusSummaryText = hasActiveFilters ? t('agent.matching_filters') : t('status.all_time');

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
      ...postsOverTime.map((row: any) => [row.date, row.count]),
      [],
      [t('analytics.csv_category'), t('analytics.thread_count')],
      ...categoryDist.map((row: any) => [row.category, row.count]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `osomba-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const isUrgent = (dateString: string) => {
    const hours = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60);
    return hours > 24;
  };

  const handleReportAction = async (reportId: number, action: 'dismiss' | 'delete-content') => {
    try {
      await api.post(`/admin/reports/${reportId}/${action}`);
      setReports((currentReports) =>
        currentReports.map((report) => {
          if (report.id !== reportId) return report;
          return {
            ...report,
            status: action === 'dismiss' ? 'DISMISSED' : 'DELETED',
            content_deleted: action === 'delete-content' ? true : report.content_deleted,
          };
        })
      );
      setNotice(action === 'dismiss' ? 'Report dismissed.' : 'Reported content deleted.');
      setError("");
    } catch (err) {
      console.error(`Failed to ${action} report:`, err);
      setError(`Failed to ${action} report.`);
    }
  };

  const handleBlockUser = async (report: ReportItem) => {
    if (!report.content_author_id || !report.content_author_email) {
      setError("This report is missing the abusive author details.");
      return;
    }

    const confirm = window.confirm(`Are you sure you want to block ${report.content_author_email}?`);
    if (!confirm) return;
    try {
      await api.post(`/admin/users/${report.content_author_id}/block`);
      setReports((currentReports) =>
        currentReports.map((currentReport) =>
          currentReport.id === report.id
            ? { ...currentReport, content_author_blocked: true }
            : currentReport
        )
      );
      setNotice(`Blocked ${report.content_author_email} from support write actions.`);
      setError("");
    } catch (err) {
      console.error("Failed to block user:", err);
      setError("Failed to block user.");
    }
  };

  const reviewReportedAuthor = async (report: ReportItem) => {
    if (!report.content_author_id) {
      setError("No author is available to review for this report.");
      return;
    }

    setDashboardTab('users');
    if (report.content_author_email) {
      setUserSearchQuery(report.content_author_email);
    }

    try {
      setInvestigationLoading(true);
      const [activityResponse, searchResponse] = await Promise.all([
        api.get(`/admin/users/${report.content_author_id}/support-activity`),
        report.content_author_email
          ? api.get(`/admin/users/investigate?query=${encodeURIComponent(report.content_author_email)}`)
          : Promise.resolve({ data: [] }),
      ]);
      setSelectedUserActivity(activityResponse.data);
      setUserSearchResults(searchResponse.data);
      setError("");
    } catch (err) {
      console.error("Failed to load the reported author review:", err);
      setError("Failed to open the reported author's review details.");
    } finally {
      setInvestigationLoading(false);
    }
  };

  const openReportedItem = (report: ReportItem) => {
    if (report.content_deleted) {
      setSelectedReport(report);
      return;
    }
    if (report.topic_id) {
      navigate(`/thread/${report.topic_id}`);
    }
  };

  const searchUsersForInvestigation = async () => {
    try {
      setInvestigationLoading(true);
      const response = await api.get(`/admin/users/investigate?query=${encodeURIComponent(userSearchQuery)}`);
      setUserSearchResults(response.data);
      setSelectedUserActivity(null);
      setError("");
    } catch (err) {
      console.error("Failed to search support users:", err);
      setError("Failed to search users for moderation review.");
    } finally {
      setInvestigationLoading(false);
    }
  };

  const loadUserActivity = async (userId: number) => {
    try {
      setInvestigationLoading(true);
      const response = await api.get(`/admin/users/${userId}/support-activity`);
      setSelectedUserActivity(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to load support activity:", err);
      setError("Failed to load the selected user's support activity.");
    } finally {
      setInvestigationLoading(false);
    }
  };

  const toggleUserBlock = async (userId: number, currentlyBlocked: boolean) => {
    try {
      await api.post(`/admin/users/${userId}/${currentlyBlocked ? 'unblock' : 'block'}`);
      setNotice(currentlyBlocked ? "User unblocked successfully." : "User blocked from support write actions.");
      setUserSearchResults((current) =>
        current.map((user) => user.user_id === userId ? { ...user, is_blocked: !currentlyBlocked } : user)
      );
      setSelectedUserActivity((current) =>
        current && current.user.user_id === userId
          ? { ...current, user: { ...current.user, is_blocked: !currentlyBlocked } }
          : current
      );
      setError("");
    } catch (err) {
      console.error("Failed to update user block state:", err);
      setError("Failed to update the user's block status.");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6] relative">
        <aside className="w-64 bg-[#F67C01]/90 backdrop-blur-md text-white flex flex-col p-6">
          <h2 className="text-white mb-8">{t('agent.title')}</h2>
        </aside>
        <main className="flex-1 p-8">
          <ThreadTableSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] relative">
      <OrganicBackground variant="dashboard" />

      <aside className="w-64 bg-[#F67C01]/90 backdrop-blur-md text-white flex flex-col z-10">
        <div className="p-6">
          <h2 className="text-white">Osomba {role === "admin" ? t('nav.admin') : t('nav.agent')}</h2>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mb-1"
          >
            <Home className="w-5 h-5" />
            <span>{t('nav.home')}</span>
          </button>
          <button
            onClick={() => setDashboardTab('threads')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-1 ${
              activeTab === 'threads' ? 'bg-white text-[#F67C01]' : 'text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <span>{t('agent.unanswered')}</span>
            </div>
            {filteredOpenThreads.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'threads' ? 'bg-[#EF4444] text-white' : 'bg-[#EF4444] text-white'
              }`}>
                {filteredOpenThreads.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setDashboardTab('reports')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-1 ${
              activeTab === 'reports' ? 'bg-white text-[#F67C01]' : 'text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Flag className="w-5 h-5" />
              <span>Reported Content</span>
            </div>
            {pendingReportCount > 0 && (
              <span className="px-2 py-0.5 bg-[#EF4444] text-white rounded-full text-xs font-bold">
                {pendingReportCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setDashboardTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
              activeTab === 'users' ? 'bg-white text-[#F67C01]' : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>User Review</span>
          </button>
          {role === "admin" && (
            <>
              <button
                onClick={() => setDashboardTab('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                  activeTab === 'analytics' ? 'bg-white text-[#F67C01]' : 'text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>{t('nav.analytics')}</span>
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mb-1"
              >
                <Users className="w-5 h-5" />
                <span>{t('nav.user_management')}</span>
              </button>
              <button
                onClick={() => navigate("/admin/categories")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mb-1"
              >
                <Settings className="w-5 h-5" />
                <span>{t('nav.category_management')}</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={user?.avatar || "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop"}
              alt="Agent"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">{user?.full_name || user?.name || t('agent.fallback_name')}</p>
              <p className="text-orange-100 text-xs uppercase">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto z-10">
        <div className="p-8">
          {notice && <div className="mb-4 rounded-lg bg-orange-50 px-4 py-3 text-sm text-[#B45309]">{notice}</div>}
          {error && <ErrorMessage message={error} />}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{activeSectionLabel}</h1>
              </div>
              <div className="flex items-center gap-3">
                {activeTab === 'analytics' && role === 'admin' && (
                  <button
                    onClick={handleExport}
                    disabled={!overview}
                    className="flex items-center gap-2 rounded-lg bg-[#F67C01] px-4 py-2 text-white hover:bg-[#d56b01] disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {t('buttons.export_csv')}
                  </button>
                )}
                {activeTab === 'threads' && (
                  <>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                >
                  <option value="All">{t('agent.all')}</option>
                  {categoryNames.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                >
                  <option value="last7">{t('agent.last_7')}</option>
                  <option value="last30">{t('agent.last_30')}</option>
                  <option value="all">{t('status.all_time')}</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                >
                  <option value="oldest">{t('agent.oldest_first')}</option>
                  <option value="newest">{t('agent.newest_first')}</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('agent.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                  </>
                )}
                {activeTab === 'reports' && (
                  <>
                    <select
                      value={reportStatusFilter}
                      onChange={(e) => setReportStatusFilter(e.target.value as "pending" | "handled" | "all")}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                    >
                      <option value="pending">Pending only</option>
                      <option value="handled">Handled only</option>
                      <option value="all">All reports</option>
                    </select>

                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                    >
                      <option value="last7">{t('agent.last_7')}</option>
                      <option value="last30">{t('agent.last_30')}</option>
                      <option value="all">{t('status.all_time')}</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                    >
                      <option value="oldest">{t('agent.oldest_first')}</option>
                      <option value="newest">{t('agent.newest_first')}</option>
                    </select>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </>
                )}
                {activeTab === 'users' && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users or leave blank to see blocked users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchUsersForInvestigation()}
                        className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F67C01]"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <button
                      onClick={searchUsersForInvestigation}
                      className="rounded-lg bg-[#F67C01] px-4 py-2 text-white hover:bg-[#d56b01]"
                    >
                      Search
                    </button>
                  </div>
                )}
              </div>
            </div>

            {activeTab !== 'users' && activeTab !== 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('agent.open_threads')}</p>
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">{filteredOpenThreads.length}</p>
                <p className="text-xs text-[#F59E0B] mt-1">{statusSummaryText}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('agent.answered')}</p>
                  <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">{filteredAnsweredThreads.length}</p>
                <p className="text-xs text-[#10B981] mt-1">{statusSummaryText}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('agent.total_posts')}</p>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">{totalVisibleTopics}</p>
                <p className="text-xs text-gray-500 mt-1">{statusSummaryText}</p>
              </div>
            </div>
            )}

            {activeTab === 'analytics' && overview && (
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 font-medium">{t('analytics.total_forum_posts')}</p>
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-3xl text-gray-900 mb-2 font-bold">{overview.total_posts}</p>
                  <div className="flex items-center gap-1 text-sm text-[#F67C01]">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('status.all_time')}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 font-medium">{t('analytics.deflection_rate')}</p>
                    <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <p className="text-3xl text-gray-900 mb-2 font-bold">{overview.deflection_rate}%</p>
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
                </div>
              </div>
            )}
          </div>

          {activeTab === 'threads' ? (
            filteredThreads.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left"></th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">{t('agent.col_title')}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">{t('agent.col_category')}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">{t('agent.col_author')}</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">{t('agent.col_posted')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThreads.map((thread) => {
                    const urgent = isUrgent(thread.created_at);
                    return (
                      <tr
                        key={thread.id}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          urgent ? "bg-red-50 hover:bg-red-100" : "hover:bg-orange-50"
                        }`}
                        onClick={() => navigate(`/thread/${thread.id}`)}
                      >
                        <td className="px-6 py-4">
                          {urgent && <span title={t('agent.over_24h')}><Flag className="w-4 h-4 text-[#EF4444]" /></span>}
                        </td>
                        <td className="px-6 py-4 flex-1">
                          <p className="text-gray-900 font-medium truncate max-w-md" title={thread.title}>{thread.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <CategoryBadge category={thread.category_name} icon={thread.category_icon || "📝"} size="small" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ImageWithFallback
                              src={thread.author_avatar}
                              alt={thread.author_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm text-gray-700 font-medium">{thread.author_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{formatDate(thread.created_at)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h2 className="mb-2 text-gray-900">{hasActiveFilters ? t('agent.no_matching_threads') : t('agent.all_caught_up')}</h2>
              <p className="text-gray-600">{hasActiveFilters ? t('agent.try_adjusting_filters') : t('agent.check_back')}</p>
            </div>
          )
        ) : activeTab === 'reports' ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {filteredReports.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Reporter</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Content Preview</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium truncate max-w-[180px]">{report.reporter_email}</td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-[180px]">{report.content_author_email || "Unknown"}</td>
                        <td className="px-6 py-4 text-gray-600">{report.content_type || "content"}</td>
                        <td className="px-6 py-4 text-red-600 font-medium">{report.reason}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <button
                            onClick={() => openReportedItem(report)}
                            className="block max-w-[260px] truncate text-left hover:text-[#F67C01]"
                            title={report.content_deleted ? "Open deleted content preview" : report.topic_id ? "Open related thread" : "No thread available"}
                          >
                            {report.target_content || "Deleted content"}
                          </button>
                          {report.content_deleted && (
                            <div className="mt-1 text-xs text-red-500">Deleted</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            report.status === 'DISMISSED' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-end gap-2">
                          {report.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              >
                                Dismiss
                              </button>
                              <button 
                                onClick={() => handleReportAction(report.id, 'delete-content')}
                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium transition-colors"
                              >
                                Delete Content
                              </button>
                            </>
                          )}
                          {report.content_author_blocked ? (
                            <button
                              onClick={() => reviewReportedAuthor(report)}
                              className="px-3 py-1 border border-orange-200 text-[#B45309] hover:bg-orange-50 rounded transition-colors"
                              title="Review blocked author"
                            >
                              Review User
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleBlockUser(report)}
                              className="px-3 py-1 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              title="Block abusive author"
                            >
                              Block User
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-4 opacity-50" />
                  {reportStatusFilter === "pending" && handledReportCount > 0 ? (
                    <div className="space-y-4">
                      <p>No pending reports remain. Reviewed items are hidden by the current filter.</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setReportStatusFilter("handled")}
                          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Show handled
                        </button>
                        <button
                          onClick={() => setReportStatusFilter("all")}
                          className="rounded-lg bg-[#F67C01] px-4 py-2 text-sm text-white hover:bg-[#d56b01]"
                        >
                          Show all reports
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{hasActiveFilters || reportStatusFilter !== "pending" ? "No reported items match the current filters." : "No reported content pending review."}</p>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <XAxis dataKey="category" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#F59E0B" name={t('analytics.thread_count')} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
              <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Search Results</h3>
                  <p className="text-sm text-gray-500">Blank search shows blocked users. You can also search by email, full name, or username.</p>
                </div>
                <div className="max-h-[540px] overflow-auto">
                  {investigationLoading && userSearchResults.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">Searching users...</div>
                  ) : userSearchResults.length > 0 ? (
                    userSearchResults.map((result) => (
                      <button
                        key={result.user_id}
                        onClick={() => loadUserActivity(result.user_id)}
                        className="w-full border-b border-gray-100 px-6 py-4 text-left transition-colors hover:bg-orange-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{result.full_name || result.user_name || result.email}</p>
                            <p className="truncate text-sm text-gray-500">{result.email}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${result.is_blocked ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-[#B45309]'}`}>
                            {result.is_blocked ? 'Blocked' : 'Active'}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-gray-500">No blocked users or matching search results were found.</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-white shadow-sm">
                {selectedUserActivity ? (
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedUserActivity.user.full_name || selectedUserActivity.user.user_name || selectedUserActivity.user.email}</h3>
                        <p className="text-sm text-gray-500">{selectedUserActivity.user.email}</p>
                      </div>
                      <button
                        onClick={() => toggleUserBlock(selectedUserActivity.user.user_id, selectedUserActivity.user.is_blocked)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${selectedUserActivity.user.is_blocked ? 'bg-orange-100 text-[#B45309] hover:bg-orange-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                      >
                        {selectedUserActivity.user.is_blocked ? 'Unblock User' : 'Block User'}
                      </button>
                    </div>

                    <div className="grid gap-6 p-6 lg:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-semibold text-gray-900">Topics</h4>
                        <div className="space-y-3">
                          {selectedUserActivity.topics.length > 0 ? selectedUserActivity.topics.map((topic) => (
                            <button
                              key={topic.id}
                              onClick={() => navigate(`/thread/${topic.id}`)}
                              className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
                            >
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="font-medium text-gray-900">{topic.title}</p>
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${topic.is_deleted ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-[#B45309]'}`}>
                                  {topic.is_deleted ? 'Removed' : 'Visible'}
                                </span>
                              </div>
                              <p className="line-clamp-3 text-sm text-gray-600">{topic.content}</p>
                            </button>
                          )) : (
                            <p className="text-sm text-gray-500">No support topics found for this user.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 font-semibold text-gray-900">Replies</h4>
                        <div className="space-y-3">
                          {selectedUserActivity.posts.length > 0 ? selectedUserActivity.posts.map((post) => (
                            <div
                              key={post.id}
                              className="rounded-lg border border-gray-200 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <button
                                  onClick={() => navigate(`/thread/${post.topic_id}`)}
                                  className="text-sm font-medium text-[#F67C01] hover:underline"
                                >
                                  Open Thread #{post.topic_id}
                                </button>
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${post.is_deleted ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-[#B45309]'}`}>
                                  {post.is_deleted ? 'Removed' : 'Visible'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{post.content}</p>
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500">No support replies found for this user.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center text-gray-500">
                    <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Select a user from the search results to inspect their visible and removed support content.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deleted Content Preview</h3>
                <p className="text-sm text-gray-500">{selectedReport.content_type || "content"} reported by {selectedReport.reporter_email}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</p>
                <p className="text-sm text-red-600">{selectedReport.reason}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Deleted content</p>
                <div className="max-h-80 overflow-auto rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedReport.target_content || "No content available."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
