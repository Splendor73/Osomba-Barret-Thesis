import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Search,
  Shield,
  UserCog,
  X,
  Settings,
  Home,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrganicBackground } from "../components/OrganicBackground";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../lib/api";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: string | null;
  avatar?: string;
  joinedDate?: string;
  status?: string;
  totalPosts?: number;
}

export function UserManagementPage() {
  const navigate = useNavigate();
  const { user: currentUser, role: currentRole, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: MessageSquare, label: t('agent.unanswered'), path: "/agent-dashboard", badge: null },
    { icon: BarChart3, label: t('nav.analytics'), path: "/admin/analytics", badge: null },
    { icon: Users, label: t('nav.user_management'), path: "/admin/users", badge: null },
    { icon: Settings, label: t('nav.category_management'), path: "/admin/categories", badge: null },
  ];

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<string>("BUYER");

  const fetchUsers = async (search = "") => {
    try {
      const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(t('users.load_error'));
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
    fetchUsers();
  }, [authLoading, currentRole, navigate]);

  // Client side search fallback & role filtering
  const filteredUsers = users.filter((user) => {
    const roleStr = user.role ? String(user.role).toLowerCase() : "buyer";
    const mappedRole = roleStr === 'admin' ? "Admin" : (roleStr === 'agent' ? "Agent" : "Customer");

    if (roleFilter !== "All" && mappedRole !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = user.full_name?.toLowerCase().includes(q);
      const matchEmail = user.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleSearchBlur = () => {
    // Optionally trigger server-side search
    fetchUsers(searchQuery);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.user_id}/role`, { role: newRole });

      // Update locally
      setUsers(users.map(u =>
        u.user_id === selectedUser.user_id ? { ...u, role: newRole } : u
      ));

      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to update role:", err);
      setError(t('users.update_error'));
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    const r = user.role ? String(user.role).toLowerCase() : "buyer";
    if (r === "admin") setNewRole("admin");
    else if (r === "agent") setNewRole("agent");
    else setNewRole("BUYER");

    setShowRoleModal(true);
  };

  const getRoleDisplay = (roleStr: string | null) => {
    const r = roleStr ? String(roleStr).toLowerCase() : "buyer";
    if (r === "admin") return "Admin";
    if (r === "agent") return "Agent";
    return "Customer";
  };

  const getRoleBadgeColor = (role: string | null) => {
    const display = getRoleDisplay(role);
    if (display === "Admin") return "bg-[#F67C01] text-white";
    if (display === "Agent") return "bg-[#46BB39] text-white";
    return "bg-gray-200 text-gray-700";
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6] relative">
        <aside className="w-64 bg-[#F67C01] text-white flex flex-col p-6">
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
      <OrganicBackground variant="minimal" />

      {/* Sidebar */}
      <aside className="w-64 bg-[#F67C01] text-white flex flex-col z-10">
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
            const isActive = item.path === "/admin/users";
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
              <p className="text-white text-sm font-medium">{currentUser?.name || currentUser?.full_name || "Admin User"}</p>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-gray-900">{t('users.title')}</h1>
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46BB39]"
                >
                  <option value="All">{t('users.all')}</option>
                  <option value="Customer">{t('users.customer')}</option>
                  <option value="Agent">{t('users.agent')}</option>
                  <option value="Admin">{t('users.admin')}</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('users.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={handleSearchBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchBlur()}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46BB39] w-80"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">{t('users.total_users')}</p>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  {users.length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">{t('users.customers')}</p>
                  <UserCog className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  {users.filter((u) => getRoleDisplay(u.role) === "Customer").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">{t('users.agents')}</p>
                  <Shield className="w-5 h-5 text-[#46BB39]" />
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  {users.filter((u) => getRoleDisplay(u.role) === "Agent").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">{t('users.admins')}</p>
                  <Shield className="w-5 h-5 text-[#F67C01]" />
                </div>
                <p className="text-2xl text-gray-900 font-bold">
                  {users.filter((u) => getRoleDisplay(u.role) === "Admin").length}
                </p>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">{t('users.col_user')}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">{t('users.col_email')}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">{t('users.col_role')}</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase font-semibold">{t('users.col_action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={u.avatar || "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop"}
                          alt={u.full_name || t('users.unnamed')}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-gray-900 font-medium">{u.full_name || t('users.unnamed')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                        {getRoleDisplay(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openRoleModal(u)}
                        className="text-[#46BB39] hover:text-[#21825C] font-medium text-sm transition-colors"
                      >
                        {t('users.change_role')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center mt-6 border border-gray-100">
              <p className="text-gray-500 font-medium">{t('users.no_users')}</p>
            </div>
          )}
        </div>
      </main>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 font-medium">{t('users.modal_title')}</h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <ImageWithFallback
                    src={selectedUser.avatar || "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop"}
                    alt={selectedUser.full_name || t('users.unnamed')}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-medium">{selectedUser.full_name || t('users.unnamed')}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1 font-medium">{t('users.current_role')}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                    {getRoleDisplay(selectedUser.role)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.new_role')}
                  </label>
                  <div className="space-y-2">
                    {[
                      { val: "BUYER", label: t('users.customer'), desc: t('users.customer_desc') },
                      { val: "agent", label: t('users.agent'), desc: t('users.agent_desc') },
                      { val: "admin", label: t('users.admin'), desc: t('users.admin_desc') }
                    ].map((r) => (
                      <label
                        key={r.val}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                        style={{
                          borderColor: newRole === r.val ? "#46BB39" : "#E5E7EB",
                          backgroundColor: newRole === r.val ? "#F0FDF4" : "white",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.val}
                          checked={newRole === r.val}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="w-4 h-4 text-[#46BB39]"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{r.label}</p>
                          <p className="text-xs text-gray-600">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 font-medium">
                  {t('users.audit_warning')}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  onClick={handleRoleChange}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#46BB39] to-[#21825C] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {t('buttons.confirm_change')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
