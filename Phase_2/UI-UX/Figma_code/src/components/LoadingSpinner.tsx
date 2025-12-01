interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

export function LoadingSpinner({ size = "medium", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-4",
    large: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-[#2563EB] border-t-transparent ${sizeClasses[size]}`}
      ></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
