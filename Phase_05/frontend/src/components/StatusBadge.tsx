import { useLanguage } from "../context/LanguageContext";

interface StatusBadgeProps {
  status: "Answered" | "Open" | "Closed" | "FAQ" | "Forum Post";
  size?: "small" | "medium";
}

const statusStyles: Record<string, string> = {
  Answered: "bg-green-100 text-green-700",
  Open: "bg-yellow-100 text-yellow-700",
  Closed: "bg-gray-100 text-gray-700",
  FAQ: "bg-green-100 text-green-700",
  "Forum Post": "bg-blue-100 text-blue-700",
};

export function StatusBadge({ status, size = "medium" }: StatusBadgeProps) {
  const { t } = useLanguage();
  const sizeClass = size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  
  // Map status string to i18n key
  const i18nKey = status === "Forum Post" ? "status.forum_post" : `status.${status.toLowerCase()}`;
  
  return (
    <span className={`inline-flex items-center rounded-full ${statusStyles[status]} ${sizeClass}`}>
      {t(i18nKey)}
    </span>
  );
}
