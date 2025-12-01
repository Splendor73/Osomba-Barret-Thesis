import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Plus,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const postsOverTimeData = [
  { date: "Nov 1", total: 28, answered: 24 },
  { date: "Nov 8", total: 35, answered: 30 },
  { date: "Nov 15", total: 42, answered: 38 },
  { date: "Nov 22", total: 38, answered: 35 },
  { date: "Nov 29", total: 45, answered: 40 },
];

const categoryDistributionData = [
  { category: "Payments", count: 89 },
  { category: "Listings", count: 67 },
  { category: "Safety", count: 54 },
  { category: "Disputes", count: 48 },
  { category: "Account", count: 45 },
  { category: "Delivery", count: 39 },
];

const deflectionFunnelData = [
  { stage: "AI Queries", count: 1523, percentage: 100 },
  { stage: "Found Answer", count: 1102, percentage: 72 },
  { stage: "Escalated to Forum", count: 421, percentage: 28 },
];

const topQuestions = [
  { question: "How do I pay with MPESA?", category: "Payments", timesAsked: 156, avgSimilarity: 94 },
  { question: "Why is my listing not showing?", category: "Listings", timesAsked: 142, avgSimilarity: 88 },
  { question: "How long does delivery take?", category: "Delivery", timesAsked: 128, avgSimilarity: 91 },
  { question: "How to report a scam?", category: "Safety", timesAsked: 98, avgSimilarity: 85 },
  { question: "Can I get a refund?", category: "Disputes", timesAsked: 87, avgSimilarity: 79 },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent", badge: null },
  { icon: MessageSquare, label: "Unanswered", path: "/agent", badge: "12" },
  { icon: FileText, label: "All Posts", path: "/agent", badge: null },
  { icon: FileText, label: "FAQs", path: "/agent", badge: null },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", badge: null },
];

export function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E40AF] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <h2 className="text-white">Somba Admin</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
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
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm">Admin User</p>
              <p className="text-blue-200 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-gray-900">Analytics Dashboard</h1>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Forum Posts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Total Forum Posts</p>
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                342
              </p>
              <div className="flex items-center gap-1 text-sm text-[#10B981]">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last period</span>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>

            {/* Deflection Rate */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Deflection Rate</p>
                <CheckCircle className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                72%
              </p>
              <div className="flex items-center gap-1 text-sm text-[#10B981]">
                <TrendingUp className="w-4 h-4" />
                <span>+5% from last period</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Queries resolved without new post</p>
            </div>

            {/* Avg Response Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                4.2 hours
              </p>
              <div className="flex items-center gap-1 text-sm text-[#10B981]">
                <TrendingDown className="w-4 h-4" />
                <span>-1.2 hrs from last period</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Target: {"<"}6 hours</p>
            </div>

            {/* FAQ Views */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">FAQ Views</p>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                8,945
              </p>
              <div className="flex items-center gap-1 text-sm text-[#10B981]">
                <TrendingUp className="w-4 h-4" />
                <span>+24% from last period</span>
              </div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Posts Over Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="mb-6 text-gray-900">Posts Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={postsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} name="Total Posts" />
                  <Line type="monotone" dataKey="answered" stroke="#10B981" strokeWidth={2} name="Answered Posts" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="mb-6 text-gray-900">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="category" stroke="#6B7280" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Deflection Funnel */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="mb-6 text-gray-900">AI Deflection Funnel</h3>
            <div className="max-w-2xl mx-auto">
              {deflectionFunnelData.map((stage, idx) => {
                const colors = ["#2563EB", "#10B981", "#EF4444"];
                return (
                  <div key={idx} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-700">{stage.stage}</p>
                      <p className="text-gray-900" style={{ fontWeight: 700 }}>
                        {stage.count.toLocaleString()} ({stage.percentage}%)
                      </p>
                    </div>
                    <div className="h-12 rounded-lg overflow-hidden" style={{ width: `${stage.percentage}%`, backgroundColor: colors[idx], opacity: 0.8 + idx * 0.1 }}>
                      <div className="h-full flex items-center justify-center text-white" style={{ fontWeight: 700 }}>
                        {stage.percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Questions Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Top Questions from AI Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Question</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Times Asked</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Avg Similarity</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topQuestions.map((q, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-gray-900 max-w-md">{q.question}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {q.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{q.timesAsked}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{q.avgSimilarity}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-1 text-sm text-[#2563EB] hover:underline">
                          <Plus className="w-4 h-4" />
                          Create FAQ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}