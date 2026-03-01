import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Settings,
  Plus,
  Edit,
  Archive,
  X,
  Save,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrganicBackground } from "../components/OrganicBackground";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

interface Category {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  postCount?: number;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent-dashboard", badge: null },
  { icon: MessageSquare, label: "Unanswered", path: "/agent-dashboard", badge: null },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", badge: null },
  { icon: Users, label: "User Management", path: "/admin/users", badge: null },
  { icon: Settings, label: "Categories", path: "/admin/categories", badge: null },
];

const emojiOptions = ["💳", "📝", "🛡️", "⚠️", "👤", "🚚", "📱", "💬", "🔧", "🎯", "📦", "🌟", "⚡", "🔔", "📊", "🎨"];

export function CategoryManagementPage() {
  const navigate = useNavigate();
  const { user: currentUser, role: currentRole, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", emoji: "💳", description: "" });

  const fetchData = async () => {
    try {
      const [catsRes, distRes] = await Promise.all([
        api.get("/support/categories?limit=100"),
        api.get("/admin/analytics/category-distribution").catch(() => ({ data: [] }))
      ]);

      const distMap = new Map();
      distRes.data.forEach((d: any) => {
        distMap.set(d.category, d.count);
      });

      const mergedCategories = catsRes.data.map((cat: any) => ({
        ...cat,
        postCount: distMap.get(cat.name) || 0
      }));

      // Sort alphabetically
      mergedCategories.sort((a: Category, b: Category) => a.name.localeCompare(b.name));
      setCategories(mergedCategories);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (currentRole !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [authLoading, currentRole, navigate]);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ name: "", emoji: "💳", description: "" });
    setSelectedCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode("edit");
    setFormData({ name: category.name, emoji: category.icon || "💳", description: category.description || "" });
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === "add") {
        await api.post("/support/categories", {
          name: formData.name,
          icon: formData.emoji,
          description: formData.description || null,
          is_active: true
        });
      } else if (selectedCategory) {
        await api.put(`/support/categories/${selectedCategory.id}`, {
          name: formData.name,
          icon: formData.emoji,
          description: formData.description || null,
          is_active: selectedCategory.is_active
        });
      }
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Failed to save category:", err);
      alert("Failed to save category. Please ensure names are unique.");
    }
  };

  const handleArchive = async (id: number) => {
    try {
      if (confirm("Are you sure you want to archive this category? Users won't be able to post in it.")) {
        await api.put(`/support/categories/${id}`, { is_active: false });
        fetchData();
      }
    } catch (err) {
      console.error("Archive failed:", err);
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      await api.put(`/support/categories/${id}`, { is_active: true });
      fetchData();
    } catch (err) {
      console.error("Unarchive failed:", err);
    }
  };

  const activeCategories = categories.filter((cat) => cat.is_active);
  const archivedCategories = categories.filter((cat) => !cat.is_active);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6] relative">
        <aside className="w-64 bg-gradient-to-b from-[#F67C01] via-[#F89C4A] to-[#46BB39] text-white flex flex-col p-6">
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
      <OrganicBackground variant="minimal" />

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#F67C01] via-[#F89C4A] to-[#46BB39] text-white flex flex-col z-10">
        <div className="p-6">
          <h2 className="text-white">Osomba Admin</h2>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin/categories";
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
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop"}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">{currentUser?.full_name || "Admin User"}</p>
              <p className="text-green-100 text-xs uppercase">{currentRole}</p>
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
            <h1 className="text-gray-900">Category Management</h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#46BB39] to-[#21825C] text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Category
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Active Categories</p>
                <Settings className="w-5 h-5 text-[#46BB39]" />
              </div>
              <p className="text-2xl text-gray-900 font-bold">
                {activeCategories.length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Total Posts by Category</p>
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl text-gray-900 font-bold">
                {categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 font-medium">Archived</p>
                <Archive className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl text-gray-900 font-bold">
                {archivedCategories.length}
              </p>
            </div>
          </div>

          {/* Active Categories */}
          <div className="mb-8">
            <h2 className="mb-4 text-gray-900 font-medium">Active Categories</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              {activeCategories.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Icon</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Posts</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCategories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-2xl">{category.icon || "📂"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-medium">{category.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700 font-semibold">{category.postCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(category)}
                              className="p-2 text-[#46BB39] hover:bg-green-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(category.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">No active categories found.</div>
              )}
            </div>
          </div>

          {/* Archived Categories */}
          {archivedCategories.length > 0 && (
            <div>
              <h2 className="mb-4 text-gray-900 font-medium">Archived Categories</h2>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Icon</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Posts</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedCategories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-2xl opacity-50">{category.icon || "📂"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500">{category.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500">{category.postCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                            Archived
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUnarchive(category.id)}
                            className="text-[#46BB39] hover:text-[#21825C] font-medium text-sm transition-colors"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 font-medium">
                  {modalMode === "add" ? "Add New Category" : "Edit Category"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Technical Support"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46BB39]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, emoji })}
                        className={`text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                          formData.emoji === emoji ? "bg-green-100 ring-2 ring-[#46BB39]" : ""
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46BB39]"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Preview</p>
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-2xl">{formData.emoji}</span>
                    <span className="text-gray-900 font-medium">{formData.name || "Category Name"}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#46BB39] to-[#21825C] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {modalMode === "add" ? "Create" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}