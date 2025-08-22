import { HealthChart } from "./HealthChart";
import { GlucoseMeasurement, PressureMeasurement } from "../../types/health";

interface ParallelHealthChartsProps {
  glucoseMeasurements: GlucoseMeasurement[];
  pressureMeasurements: PressureMeasurement[];
  className?: string;
}

export const ParallelHealthCharts = ({
  glucoseMeasurements,
  pressureMeasurements,
  className = "",
}: ParallelHealthChartsProps) => {
  // Preparar datos para glucemia
  const glucoseData = glucoseMeasurements.map((measurement) => ({
    timestamp: measurement.timestamp.toISOString(),
    value: measurement.value,
  }));

  // Preparar datos para presión (sistólica y diastólica)
  const pressureSystolicData = pressureMeasurements.map((measurement) => ({
    timestamp: measurement.timestamp.toISOString(),
    value: measurement.systolic,
  }));

  const pressureDiastolicData = pressureMeasurements.map((measurement) => ({
    timestamp: measurement.timestamp.toISOString(),
    value: measurement.diastolic,
  }));

  // Colores para glucemia (verde para valores normales)
  const glucoseColors = {
    primary: "#10B981", // verde
    background: "rgba(16, 185, 129, 0.1)",
    border: "#10B981",
  };

  // Colores para presión (azul para valores normales)
  const pressureColors = {
    primary: "#3B82F6", // azul
    background: "rgba(59, 130, 246, 0.1)",
    border: "#3B82F6",
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gráfico de Glucemia */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-700">🩸 Glucemia</h4>
          <div className="text-sm text-gray-500">
            {glucoseMeasurements.length} mediciones
          </div>
        </div>
        <HealthChart
          datasets={[
            {
              label: "Glucemia",
              data: glucoseData,
              color: glucoseColors.primary,
              backgroundColor: glucoseColors.background,
              borderColor: glucoseColors.border,
            },
          ]}
          unit="mg/dL"
          minValue={50}
          maxValue={400}
        />
      </div>

      {/* Gráfico de Presión */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-700">
            ❤️ Presión Arterial
          </h4>
          <div className="text-sm text-gray-500">
            {pressureMeasurements.length} mediciones
          </div>
        </div>
        <HealthChart
          datasets={[
            {
              label: "Presión Sistólica",
              data: pressureSystolicData,
              color: pressureColors.primary,
              backgroundColor: pressureColors.background,
              borderColor: pressureColors.border,
            },
            {
              label: "Presión Diastólica",
              data: pressureDiastolicData,
              color: "#EF4444", // Rojo para diastólica
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "#EF4444",
            },
          ]}
          unit="mmHg"
          minValue={40}
          maxValue={200}
        />
      </div>

      {/* Resumen comparativo */}
      {glucoseMeasurements.length > 0 && pressureMeasurements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            📈 Resumen Comparativo
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Última Glucemia</p>
              <p className="text-xl font-bold text-green-600">
                {glucoseMeasurements[glucoseMeasurements.length - 1]?.value}{" "}
                mg/dL
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Presión</p>
              <p className="text-xl font-bold text-blue-600">
                {
                  pressureMeasurements[pressureMeasurements.length - 1]
                    ?.systolic
                }
                /
                {
                  pressureMeasurements[pressureMeasurements.length - 1]
                    ?.diastolic
                }{" "}
                mmHg
              </p>
            </div>
          </div>

          {/* Indicadores de estado */}
          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Atención</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Crítico</span>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {glucoseMeasurements.length === 0 &&
        pressureMeasurements.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No hay datos para analizar
            </h3>
            <p className="text-gray-500">
              Agrega mediciones de glucemia y presión para ver los gráficos
            </p>
          </div>
        )}
    </div>
  );
};
