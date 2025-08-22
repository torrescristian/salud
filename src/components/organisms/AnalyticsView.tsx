import { ParallelHealthCharts } from "../molecules/ParallelHealthCharts";
import {
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";

interface AnalyticsViewProps {
  glucoseMeasurements: GlucoseMeasurement[];
  pressureMeasurements: PressureMeasurement[];
  insulinEntries: InsulinEntry[];
  className?: string;
}

export function AnalyticsView({
  glucoseMeasurements,
  pressureMeasurements,
  insulinEntries,
  className = "",
}: AnalyticsViewProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gráficos Paralelos de Salud */}
      <ParallelHealthCharts
        glucoseMeasurements={glucoseMeasurements}
        pressureMeasurements={pressureMeasurements}
      />

      {/* Resumen de Insulina */}
      {insulinEntries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💉 Aplicaciones de Insulina
          </h3>
          <div className="space-y-3">
            {insulinEntries
              .slice(-5)
              .reverse()
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">
                      {entry.dose} unidades
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
