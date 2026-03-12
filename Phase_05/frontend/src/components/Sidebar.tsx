import { useState, useEffect } from "react";
import api from "../lib/api";
import { useLanguage } from "../context/LanguageContext";

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
  const { t } = useLanguage();
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
    <aside className="hidden lg:block w-64 bg-white rounded-xl shadow-sm p-6 border border-gray-100 self-start sticky top-24">
      <h3 className="mb-4 text-gray-900 font-semibold">{t('sidebar.browse_by_category')}</h3>
      <nav className="space-y-1">
        {categories.map((cat) => {
          const baseName = (cat.name_en || cat.name || "").trim();
          // Use flattened key format: categories.name_payments
          const translationKey = `categories.name_${baseName.toLowerCase()}`;
          const translatedName = t(translationKey);
          
          const displayName = translatedName !== translationKey ? translatedName : baseName;
          const isActive = activeCategory === baseName;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryClick?.(baseName)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#F67C01] to-[#46BB39] text-white shadow-sm"
                  : "text-gray-700 hover:bg-orange-50 hover:text-[#F67C01]"
              }`}
            >
              <span className="text-lg">{cat.icon_url || cat.icon || "📝"}</span>
              <span className="font-medium text-sm">{displayName}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
