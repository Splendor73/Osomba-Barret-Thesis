interface CategoryBadgeProps {
  category: string;
  icon?: string;
  size?: "small" | "medium" | "large";
  clickable?: boolean;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  Payments: "bg-blue-100 text-blue-700",
  Listings: "bg-purple-100 text-purple-700",
  Safety: "bg-green-100 text-green-700",
  Disputes: "bg-red-100 text-red-700",
  Account: "bg-yellow-100 text-yellow-700",
  Delivery: "bg-indigo-100 text-indigo-700",
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
