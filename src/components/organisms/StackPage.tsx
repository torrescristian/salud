import { ReactNode } from "react";
import { Button } from "../atoms/Button";

export interface StackPageProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export function StackPage({
  title,
  onBack,
  children,
  showBackButton = true,
  className = "",
}: StackPageProps) {
  return (
    <div className={`fixed inset-0 bg-white z-50 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              onClick={onBack}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm px-3 py-1"
            >
              ← Volver
            </Button>
          )}
          <h1 className="text-xl font-bold flex-1 text-center">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
