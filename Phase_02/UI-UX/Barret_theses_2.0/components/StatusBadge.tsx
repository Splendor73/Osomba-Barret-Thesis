interface StatusBadgeProps {
  status: "Answered" | "Open" | "Closed" | "FAQ" | "Forum Post";
  size?: "small" | "medium";
}

const statusStyles: Record<string, string> = {
  Answered: "bg-[#46BB39]/10 text-[#46BB39] border border-[#46BB39]/20",
  Open: "bg-[#F67C01]/10 text-[#F67C01] border border-[#F67C01]/20",
  Closed: "bg-gray-100 text-gray-700 border border-gray-200",
  FAQ: "bg-[#46BB39]/10 text-[#46BB39] border border-[#46BB39]/20",
  "Forum Post": "bg-[#F67C01]/10 text-[#F67C01] border border-[#F67C01]/20",
};

export function StatusBadge({ status, size = "medium" }: StatusBadgeProps) {
  const sizeClass = size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  
  return (
    <span className={`inline-flex items-center rounded-full ${statusStyles[status]} ${sizeClass}`}>
      {status}
    </span>
  );
}