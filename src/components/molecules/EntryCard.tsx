import { ReactNode } from "react";
import { Button } from "../atoms/Button";

export interface EntryCardProps {
  time: string;
  icon: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  onEdit?: () => void;
  className?: string;
}

export function EntryCard({
  time,
  icon,
  title,
  subtitle,
  status,
  onEdit,
  className = "",
}: EntryCardProps) {
  return (
    <div
      className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg ${className}`}
    >
      <span className="text-gray-500 text-sm">{time}</span>

      <div className="flex-1 flex items-center space-x-2">
        <span className="text-lg">{icon}</span>

        <div className="flex-1">
          <span className="font-medium">{title}</span>
          {subtitle && (
            <span className="text-sm text-gray-600 ml-2">{subtitle}</span>
          )}
        </div>

        {status && status}

        {onEdit && (
          <Button
            onClick={onEdit}
            variant="secondary"
            size="sm"
            className="text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 border-none"
          >
            ✏️ Editar
          </Button>
        )}
      </div>
    </div>
  );
}
