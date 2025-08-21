import React from "react";
import { Card, StatusBadge } from "../atoms";
import { GlucoseMeasurementCard } from "../molecules";
import { GlucoseMeasurement, PressureMeasurement, FoodEntry } from "@/domain";

export interface HealthDashboardProps {
  glucoseMeasurements: GlucoseMeasurement[];
  pressureMeasurements: PressureMeasurement[];
  foodEntries: FoodEntry[];
  onAddGlucoseMeasurement: () => void;
  onAddPressureMeasurement: () => void;
  onAddFoodEntry: () => void;
  onViewAllMeasurements: () => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  glucoseMeasurements,
  pressureMeasurements,
  foodEntries,
  onAddGlucoseMeasurement,
  onAddPressureMeasurement,
  onAddFoodEntry,
  onViewAllMeasurements,
}) => {
  const recentGlucose = glucoseMeasurements.slice(0, 3);
  const recentFood = foodEntries.slice(0, 3);

  const getGlucoseStatus = () => {
    if (glucoseMeasurements.length === 0) return "info";
    const criticalCount = glucoseMeasurements.filter(
      (m) => m.status === "critical"
    ).length;
    const warningCount = glucoseMeasurements.filter(
      (m) => m.status === "warning"
    ).length;

    if (criticalCount > 0) return "critical";
    if (warningCount > 0) return "warning";
    return "normal";
  };

  const getPressureStatus = () => {
    if (pressureMeasurements.length === 0) return "info";
    const criticalCount = pressureMeasurements.filter(
      (m) => m.status === "critical"
    ).length;
    const warningCount = pressureMeasurements.filter(
      (m) => m.status === "warning"
    ).length;

    if (criticalCount > 0) return "critical";
    if (warningCount > 0) return "warning";
    return "normal";
  };

  const getNutritionalStatus = () => {
    if (foodEntries.length === 0) return "info";
    const today = new Date();
    const todayEntries = foodEntries.filter(
      (entry) => entry.timestamp.toDateString() === today.toDateString()
    );

    if (todayEntries.length >= 5) return "success";
    if (todayEntries.length >= 3) return "normal";
    return "warning";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard de Salud
        </h1>
        <p className="text-gray-600">
          Monitorea tu salud y nutrición en tiempo real
        </p>
      </div>

      {/* Quick Stats - Mobile First */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="text-center p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-2xl sm:text-3xl">🩸</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Glucosa</h3>
          <StatusBadge status={getGlucoseStatus()} className="mb-2">
            {glucoseMeasurements.length} mediciones
          </StatusBadge>
          <button
            onClick={onAddGlucoseMeasurement}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            + Agregar medición
          </button>
        </Card>

        <Card className="text-center p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-2xl sm:text-3xl">💓</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
            Presión Arterial
          </h3>
          <StatusBadge status={getPressureStatus()} className="mb-2">
            {pressureMeasurements.length} mediciones
          </StatusBadge>
          <button
            onClick={onAddPressureMeasurement}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            + Agregar medición
          </button>
        </Card>

        <Card className="text-center p-4 sm:p-6">
          <div className="flex items-center justify-center mb-3">
            <span className="text-2xl sm:text-3xl">🍽️</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
            Nutrición
          </h3>
          <StatusBadge status={getNutritionalStatus()} className="mb-2">
            {foodEntries.length} entradas
          </StatusBadge>
          <button
            onClick={onAddFoodEntry}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            + Agregar alimento
          </button>
        </Card>
      </div>

      {/* Recent Measurements - Mobile First */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Recent Glucose */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mediciones de Glucosa Recientes
            </h3>
            <button
              onClick={onViewAllMeasurements}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todas
            </button>
          </div>

          {recentGlucose.length > 0 ? (
            <div className="space-y-3">
              {recentGlucose.map((measurement) => (
                <GlucoseMeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay mediciones recientes
            </p>
          )}
        </Card>

        {/* Recent Food */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Alimentos Recientes
            </h3>
            <button
              onClick={onViewAllMeasurements}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todos
            </button>
          </div>

          {recentFood.length > 0 ? (
            <div className="space-y-3">
              {recentFood.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">{entry.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {entry.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.quantity}g • {entry.foodType}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay alimentos registrados
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
