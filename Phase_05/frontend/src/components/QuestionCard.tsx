import { Eye } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { StatusBadge } from "./StatusBadge";

interface QuestionCardProps {
  id: string;
  status: "FAQ" | "Forum Post";
  title: string;
  preview: string;
  category: string;
  categoryIcon?: string;
  date: string;
  views: number;
  onClick?: () => void;
}

export function QuestionCard({
  status,
  title,
  preview,
  category,
  categoryIcon,
  date,
  views,
  onClick,
}: QuestionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
    >
      {/* Status Badge */}
      <div className="mb-3">
        <StatusBadge status={status} size="small" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-gray-900 hover:text-[#2563EB] transition-colors">
        {title}
      </h3>

      {/* Preview */}
      <p className="text-gray-600 mb-4 line-clamp-2">
        {preview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CategoryBadge category={category} icon={categoryIcon} size="small" />
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Eye className="w-4 h-4" />
          <span className="text-xs">{views}</span>
        </div>
      </div>
    </div>
  );
}
