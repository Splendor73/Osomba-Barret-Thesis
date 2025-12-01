import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = "Something went wrong", message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-[#EF4444] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
