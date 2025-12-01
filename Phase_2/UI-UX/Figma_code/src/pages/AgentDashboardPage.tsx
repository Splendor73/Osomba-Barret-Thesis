import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  User,
  Search,
  Flag,
  Eye,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Thread {
  id: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  postedTime: string;
  views: number;
  urgent: boolean;
}

const mockThreads: Thread[] = [
  {
    id: "1",
    title: "My MPESA payment is not showing up",
    category: "Payments",
    author: {
      name: "Jane Doe",
      avatar: "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop",
    },
    postedTime: "2 hours ago",
    views: 42,
    urgent: true,
  },
  {
    id: "2",
    title: "Why is my listing not appearing in search?",
    category: "Listings",
    author: {
      name: "John Smith",
      avatar: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop",
    },
    postedTime: "5 hours ago",
    views: 67,
    urgent: false,
  },
  {
    id: "3",
    title: "Buyer is asking for refund after receiving item",
    category: "Disputes",
    author: {
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop",
    },
    postedTime: "8 hours ago",
    views: 28,
    urgent: true,
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent", badge: null },
  { icon: MessageSquare, label: "Unanswered", path: "/agent", badge: "12" },
  { icon: FileText, label: "All Posts", path: "/agent", badge: null },
  { icon: FileText, label: "FAQs", path: "/agent", badge: null },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", badge: null },
];

export function AgentDashboardPage() {
  const navigate = useNavigate();
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Last 7 days");
  const [sortBy, setSortBy] = useState("Oldest first");

  const toggleThreadSelection = (id: string) => {
    setSelectedThreads((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const filteredThreads = mockThreads.filter((thread) => {
    if (categoryFilter !== "All" && thread.category !== categoryFilter) return false;
    if (searchQuery && !thread.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E40AF] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <h2 className="text-white">Somba Agent</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
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
                {item.badge && (
                  <span className="px-2 py-0.5 bg-[#EF4444] text-white rounded-full text-xs">
                    {item.badge}
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
              src="https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop"
              alt="Agent"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm">John Agent</p>
              <p className="text-blue-200 text-xs">Support Team</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-gray-900">Unanswered Threads</h1>
              <div className="flex items-center gap-3">
                {/* Filters */}
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

                {/* Search */}
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
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  12
                </p>
                <p className="text-xs text-[#F59E0B] mt-1">Needs attention</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <div className="w-2 h-2 bg-[#2563EB] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  4.2 hours
                </p>
                <p className="text-xs text-[#10B981] mt-1">-1.2 hrs from last week</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Answered Today</p>
                  <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  8
                </p>
                <p className="text-xs text-[#10B981] mt-1">Great work!</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Pending FAQs</p>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  3
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to publish</p>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedThreads.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-900">{selectedThreads.length} selected</p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Assign
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Close
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Export
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
                  {filteredThreads.map((thread) => (
                    <tr
                      key={thread.id}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        thread.urgent ? "bg-red-50 hover:bg-red-100" : "hover:bg-blue-50"
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
                        {thread.urgent && <Flag className="w-4 h-4 text-[#EF4444]" />}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 truncate max-w-md">{thread.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <CategoryBadge category={thread.category} size="small" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ImageWithFallback
                            src={thread.author.avatar}
                            alt={thread.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700">{thread.author.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{thread.postedTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{thread.views}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Empty State
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h2 className="mb-2 text-gray-900">All caught up! No unanswered threads.</h2>
              <p className="text-gray-600">Great work!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
