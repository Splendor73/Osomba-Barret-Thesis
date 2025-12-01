import { CreditCard, FileText, Shield, AlertTriangle, User, Truck } from "lucide-react";

interface SidebarProps {
  activeCategory?: string;
  onCategoryClick?: (category: string) => void;
}

const categories = [
  { name: "Payments", icon: CreditCard, emoji: "💳" },
  { name: "Listings", icon: FileText, emoji: "📝" },
  { name: "Safety", icon: Shield, emoji: "🛡️" },
  { name: "Disputes", icon: AlertTriangle, emoji: "⚠️" },
  { name: "Account", icon: User, emoji: "👤" },
  { name: "Delivery", icon: Truck, emoji: "🚚" },
];

export function Sidebar({ activeCategory, onCategoryClick }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-64 bg-white rounded-lg shadow-sm p-4">
      <h3 className="mb-4 text-gray-900">Categories</h3>
      <nav className="space-y-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryClick?.(cat.name)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? "bg-blue-50 text-[#2563EB]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
