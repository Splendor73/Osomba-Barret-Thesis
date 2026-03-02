import { useState, useEffect } from "react";
import api from "../lib/api";

interface SidebarProps {
  activeCategory?: string;
  onCategoryClick?: (category: string) => void;
}

type Category = {
  id: number;
  name: string;
  name_en?: string;
  icon_url?: string;
};

export function Sidebar({ activeCategory, onCategoryClick }: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/support/categories/");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="mb-4 text-gray-900 font-semibold">Browse by Category</h3>
      <nav className="space-y-1">
        {categories.map((cat) => {
          const name = cat.name_en || cat.name;
          const isActive = activeCategory === name;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryClick?.(name)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#F67C01] to-[#F89C4A] text-white shadow-sm"
                  : "text-gray-700 hover:bg-orange-50 hover:text-[#F67C01]"
              }`}
            >
              <span className="text-lg">{cat.icon_url || "📝"}</span>
              <span className="font-medium text-sm">{name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
