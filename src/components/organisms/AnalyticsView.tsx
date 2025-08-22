import { useState, useCallback } from "react";
import { ParallelHealthCharts } from "../molecules/ParallelHealthCharts";
import { CompactFilters, FilterPeriod } from "../molecules/CompactFilters";
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
  const [filteredGlucose, setFilteredGlucose] = useState(glucoseMeasurements);
  const [filteredPressure, setFilteredPressure] =
    useState(pressureMeasurements);
  const [filteredInsulin, setFilteredInsulin] = useState(insulinEntries);

  const handlePeriodChange = useCallback(
    (_period: FilterPeriod, startDate: Date, endDate: Date) => {
      // Filtrar glucemia
      const filteredGlucoseData = glucoseMeasurements.filter((measurement) => {
        const measurementDate = new Date(measurement.timestamp);
        const measurementDateOnly = new Date(
          measurementDate.getFullYear(),
          measurementDate.getMonth(),
          measurementDate.getDate()
        );
        const startDateOnly = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const endDateOnly = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        return (
          measurementDateOnly >= startDateOnly &&
          measurementDateOnly <= endDateOnly
        );
      });

      // Filtrar presión
      const filteredPressureData = pressureMeasurements.filter(
        (measurement) => {
          const measurementDate = new Date(measurement.timestamp);
          const measurementDateOnly = new Date(
            measurementDate.getFullYear(),
            measurementDate.getMonth(),
            measurementDate.getDate()
          );
          const startDateOnly = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
          const endDateOnly = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );

          return (
            measurementDateOnly >= startDateOnly &&
            measurementDateOnly <= endDateOnly
          );
        }
      );

      // Filtrar insulina
      const filteredInsulinData = insulinEntries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        const entryDateOnly = new Date(
          entryDate.getFullYear(),
          entryDate.getMonth(),
          entryDate.getDate()
        );
        const startDateOnly = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const endDateOnly = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        return entryDateOnly >= startDateOnly && entryDateOnly <= endDateOnly;
      });

      setFilteredGlucose(filteredGlucoseData);
      setFilteredPressure(filteredPressureData);
      setFilteredInsulin(filteredInsulinData);
    },
    [glucoseMeasurements, pressureMeasurements, insulinEntries]
  );
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filtros Compactos */}
      <CompactFilters onPeriodChange={handlePeriodChange} />

      {/* Gráficos Paralelos de Salud */}
      <ParallelHealthCharts
        glucoseMeasurements={filteredGlucose}
        pressureMeasurements={filteredPressure}
      />

      {/* Resumen de Insulina */}
      {filteredInsulin.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💉 Aplicaciones de Insulina
          </h3>
          <div className="space-y-3">
            {filteredInsulin
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
