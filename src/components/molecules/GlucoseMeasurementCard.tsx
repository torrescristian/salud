import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, StatusBadge } from "../atoms";
import { GlucoseMeasurement } from "@/domain/GlucoseMeasurement";

export interface GlucoseMeasurementCardProps {
  measurement: GlucoseMeasurement;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const getStatusType = (status: string): "normal" | "warning" | "critical" => {
  switch (status) {
    case "normal":
      return "normal";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    default:
      return "normal";
  }
};

const getContextLabel = (context: string): string => {
  switch (context) {
    case "fasting":
      return "En ayunas";
    case "postPrandial":
      return "Postprandial";
    case "custom":
      return "Personalizado";
    default:
      return context;
  }
};

export const GlucoseMeasurementCard: React.FC<GlucoseMeasurementCardProps> = ({
  measurement,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">🩸</span>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {measurement.value} mg/dL
              </h4>
              <p className="text-sm text-gray-600">
                {getContextLabel(measurement.context)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <StatusBadge status={getStatusType(measurement.status)}>
              {measurement.status === "normal" && "Normal"}
              {measurement.status === "warning" && "Advertencia"}
              {measurement.status === "critical" && "Crítico"}
            </StatusBadge>
            <span className="text-xs text-gray-500">
              {format(measurement.timestamp, "dd/MM/yyyy HH:mm", {
                locale: es,
              })}
            </span>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
