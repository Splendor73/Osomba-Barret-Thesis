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
    <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="mb-4 text-gray-900 font-semibold">Browse by Category</h3>
      <nav className="space-y-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryClick?.(cat.name)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white shadow-sm"
                  : "text-gray-700 hover:bg-orange-50 hover:text-[#F67C01]"
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="font-medium text-sm">{cat.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}