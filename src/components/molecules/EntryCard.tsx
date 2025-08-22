import { Button } from "../atoms/Button";

export interface EntryCardProps {
  time: string;
  icon: string;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  className?: string;
  statusType?: "normal" | "warning" | "critical";
}

export function EntryCard({
  time,
  icon,
  title,
  subtitle,
  onEdit,
  className = "",
  statusType = "normal",
}: EntryCardProps) {
  // Función para obtener el color de fondo según el estado
  const getBackgroundColor = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "critical":
        return "bg-red-50 border-red-100";
      case "warning":
        return "bg-yellow-50 border-yellow-100";
      case "normal":
        return "bg-green-50 border-green-100";
      default:
        return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border ${getBackgroundColor(
        statusType
      )} ${className}`}
    >
      {/* Primera fila: Hora y botón Editar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{time}</span>
        {onEdit && (
          <Button
            onClick={onEdit}
            variant="secondary"
            size="sm"
            className="text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-100 border-none px-2 py-1 text-xs"
          >
            ✏️ Editar
          </Button>
        )}
      </div>

      {/* Segunda fila: Icono y contenido */}
      <div className="flex items-center space-x-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{title}</div>
          {subtitle && (
            <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}
