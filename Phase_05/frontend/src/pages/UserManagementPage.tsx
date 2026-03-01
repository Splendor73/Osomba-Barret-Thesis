import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Search,
  Shield,
  UserCog,
  CheckCircle,
  X,
  Settings,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrganicBackground } from "../components/OrganicBackground";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Agent" | "Admin";
  avatar: string;
  joinedDate: string;
  status: "Active" | "Inactive";
  totalPosts: number;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop",
    joinedDate: "Jan 15, 2024",
    status: "Active",
    totalPosts: 5,
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@example.com",
    role: "Agent",
    avatar: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop",
    joinedDate: "Dec 8, 2023",
    status: "Active",
    totalPosts: 142,
  },
  {
    id: "3",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "Customer",
    avatar: "https://images.unsplash.com/photo-1693035730007-fbc2c14c6814?w=100&h=100&fit=crop",
    joinedDate: "Feb 20, 2024",
    status: "Active",
    totalPosts: 12,
  },
  {
    id: "4",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=100&h=100&fit=crop",
    joinedDate: "Nov 1, 2023",
    status: "Active",
    totalPosts: 89,
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agent-dashboard", badge: null },
  { icon: MessageSquare, label: "Unanswered", path: "/agent-dashboard", badge: "12" },
  { icon: FileText, label: "All Posts", path: "/agent-dashboard", badge: null },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics", badge: null },
  { icon: Users, label: "User Management", path: "/admin/users", badge: null },
  { icon: Settings, label: "Categories", path: "/admin/categories", badge: null },
];

export function UserManagementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<"Customer" | "Agent" | "Admin">("Customer");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = () => {
    if (selectedUser) {
      // In a real app, this would make an API call and log to audit trail
      console.log(`Audit Log: Changed ${selectedUser.name} role from ${selectedUser.role} to ${newRole}`);
      setShowRoleModal(false);
      setSelectedUser(null);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-[#F67C01] text-white";
      case "Agent":
        return "bg-[#46BB39] text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] relative">
      {/* Organic Background */}
      <OrganicBackground variant="minimal" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#F67C01] via-[#F89C4A] to-[#46BB39] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <h2 className="text-white">Osomba Admin</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
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
              <p className="text-green-100 text-xs">Administrator</p>
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
              <h1 className="text-gray-900">User Management</h1>
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46BB39]"
                >
                  <option>All</option>
                  <option>Customer</option>
                  <option>Agent</option>
                  <option>Admin</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#46BB39] w-80"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  {mockUsers.length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Customers</p>
                  <UserCog className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  {mockUsers.filter((u) => u.role === "Customer").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Agents</p>
                  <Shield className="w-5 h-5 text-[#46BB39]" />
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  {mockUsers.filter((u) => u.role === "Agent").length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Admins</p>
                  <Shield className="w-5 h-5 text-[#F67C01]" />
                </div>
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                  {mockUsers.filter((u) => u.role === "Admin").length}
                </p>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Posts</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-gray-900 font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{user.joinedDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{user.totalPosts}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="text-[#46BB39] hover:text-[#21825C] font-medium text-sm"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center mt-6">
              <p className="text-gray-500">No users found matching your search.</p>
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
                <h3 className="text-gray-900">Change User Role</h3>
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
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Current Role</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Role
                  </label>
                  <div className="space-y-2">
                    {(["Customer", "Agent", "Admin"] as const).map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                        style={{
                          borderColor: newRole === role ? "#46BB39" : "#E5E7EB",
                          backgroundColor: newRole === role ? "#F0FDF4" : "white",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={newRole === role}
                          onChange={(e) => setNewRole(e.target.value as typeof role)}
                          className="w-4 h-4 text-[#46BB39]"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{role}</p>
                          <p className="text-xs text-gray-600">
                            {role === "Customer" && "Can post questions and view content"}
                            {role === "Agent" && "Can answer questions and manage posts"}
                            {role === "Admin" && "Full access to all features and settings"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ This action will be logged in the audit trail.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#46BB39] to-[#21825C] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}