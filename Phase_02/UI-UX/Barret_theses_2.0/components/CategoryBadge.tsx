interface CategoryBadgeProps {
  category: string;
  icon?: string;
  size?: "small" | "medium" | "large";
  clickable?: boolean;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  Payments: "bg-[#46BB39]/10 text-[#46BB39] border border-[#46BB39]/20",
  Listings: "bg-[#F67C01]/10 text-[#F67C01] border border-[#F67C01]/20",
  Safety: "bg-[#4E8149]/10 text-[#4E8149] border border-[#4E8149]/20",
  Disputes: "bg-red-100 text-red-700 border border-red-200",
  Account: "bg-[#21825C]/10 text-[#21825C] border border-[#21825C]/20",
  Delivery: "bg-[#F67C01]/10 text-[#F67C01] border border-[#F67C01]/20",
};

export function CategoryBadge({ category, icon, size = "medium", clickable = false, onClick }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || "bg-gray-100 text-gray-700";
  
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1.5 text-sm",
    large: "px-4 py-2 text-base",
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full ${colorClass} ${sizeClasses[size]} ${
        clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
      }`}
    >
      {icon && <span>{icon}</span>}
      {category}
    </span>
  );
}