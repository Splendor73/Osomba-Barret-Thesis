import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  Search,
  Flag,
  Eye,
  MoreVertical,
  CheckCircle,
  Users,
  Settings,
} from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ThreadTableSkeleton } from "../components/SkeletonLoader";
import { ErrorMessage } from "../components/ErrorMessage";
import { OrganicBackground } from "../components/OrganicBackground";
import { useAuth } from "../context/AuthContext";
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

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent-dashboard", badge: null, roles: ["agent", "admin"] },
  { icon: MessageSquare, label: "Unanswered", path: "/agent-dashboard", badge: "dynamic", roles: ["agent", "admin"] },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", badge: null, roles: ["admin"] },
  { icon: Users, label: "User Management", path: "/admin/users", badge: null, roles: ["admin"] },
  { icon: Settings, label: "Categories", path: "/admin/categories", badge: null, roles: ["admin"] },
];

export function AgentDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedThreads, setSelectedThreads] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Last 7 days");
  const [sortBy, setSortBy] = useState("Newest first");

  useEffect(() => {
    if (authLoading) return;
    if (role !== "agent" && role !== "admin") {
      navigate("/");
      return;
    }

    const fetchTopics = async () => {
      try {
        const res = await api.get("/support/topics?limit=100");
        setTopics(res.data);
      } catch (err: any) {
        console.error("Agent dashboard error:", err);
        setError("Failed to load threads.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, [authLoading, role, navigate]);

  const toggleThreadSelection = (id: number) => {
    setSelectedThreads((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const unansweredThreads = topics.filter((t) => t.status !== "Answered");

  const filteredThreads = unansweredThreads.filter((thread) => {
    if (categoryFilter !== "All" && thread.category_name !== categoryFilter) return false;
    if (searchQuery && !thread.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Date filter could be added here if needed
    return true;
  });

  // Sort
  filteredThreads.sort((a, b) => {
    if (sortBy === "Newest first") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "Oldest first") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "Most views") return b.view_count - a.view_count;
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const isUrgent = (dateString: string) => {
    const hours = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60);
    return hours > 24;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6] relative">
        <aside className="w-64 bg-gradient-to-b from-[#F67C01] via-[#F89C4A] to-[#46BB39] text-white flex flex-col p-6">
          <h2 className="text-white mb-8">Osomba Agent</h2>
        </aside>
        <main className="flex-1 p-8">
          <ThreadTableSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] relative">
      <OrganicBackground variant="minimal" />

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#F67C01] via-[#F89C4A] to-[#46BB39] text-white flex flex-col z-10">
        <div className="p-6">
          <h2 className="text-white">Osomba {role === "admin" ? "Admin" : "Agent"}</h2>
        </div>

        <nav className="flex-1 px-3">
          {navItems.filter(item => item.roles.includes(role || "")).map((item) => {
            const Icon = item.icon;
            const badgeValue = item.badge === 'dynamic' ? unansweredThreads.length : item.badge;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mb-1"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {badgeValue && (
                  <span className="px-2 py-0.5 bg-[#EF4444] text-white rounded-full text-xs font-bold">
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={user?.avatar || "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop"}
              alt="Agent"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">{user?.full_name || user?.name || "Support Agent"}</p>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-gray-900">Unanswered Threads</h1>
              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option>All</option>
                  <option>Payments</option>
                  <option>Listings</option>
                  <option>Safety</option>
                  <option>Disputes</option>
                  <option>Account</option>
                  <option>Delivery</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>All time</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option>Oldest first</option>
                  <option>Newest first</option>
                  <option>Most views</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Open Threads</p>
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  {unansweredThreads.length}
                </p>
                <p className="text-xs text-[#F59E0B] mt-1">Needs attention</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <div className="w-2 h-2 bg-[#2563EB] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  4.2 hours
                </p>
                <p className="text-xs text-[#10B981] mt-1">-1.2 hrs from last week</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Answered Today</p>
                  <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  8
                </p>
                <p className="text-xs text-[#10B981] mt-1">Great work!</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  {topics.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedThreads.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-900 font-medium">{selectedThreads.length} selected</p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Assign
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Thread Table */}
          {filteredThreads.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="w-12 px-6 py-3 text-left"></th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Posted</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Views</th>
                    <th className="w-12 px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThreads.map((thread) => {
                    const urgent = isUrgent(thread.created_at);
                    return (
                      <tr
                        key={thread.id}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          urgent ? "bg-red-50 hover:bg-red-100" : "hover:bg-blue-50"
                        }`}
                        onClick={() => navigate(`/thread/${thread.id}`)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedThreads.includes(thread.id)}
                            onChange={() => toggleThreadSelection(thread.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {urgent && <span title="Over 24h old"><Flag className="w-4 h-4 text-[#EF4444]" /></span>}
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">{thread.view_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
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
              <h2 className="mb-2 text-gray-900">All caught up! No unanswered threads.</h2>
              <p className="text-gray-600">Great work! Check back later.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}