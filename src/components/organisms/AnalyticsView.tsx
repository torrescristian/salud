import { useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
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
  const weekData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map((day) => {
      const dayGlucose = glucoseMeasurements.filter((m) =>
        isSameDay(new Date(m.timestamp), day)
      );
      const dayPressure = pressureMeasurements.filter((m) =>
        isSameDay(new Date(m.timestamp), day)
      );
      const dayInsulin = insulinEntries.filter((m) =>
        isSameDay(new Date(m.timestamp), day)
      );

      return {
        date: day,
        dayName: format(day, "EEE", { locale: es }),
        glucose: dayGlucose,
        pressure: dayPressure,
        insulin: dayInsulin,
        glucoseAvg:
          dayGlucose.length > 0
            ? dayGlucose.reduce((sum, m) => sum + m.value, 0) /
              dayGlucose.length
            : null,
        pressureAvg:
          dayPressure.length > 0
            ? dayPressure.reduce((sum, m) => sum + m.systolic, 0) /
              dayPressure.length
            : null,
      };
    });
  }, [glucoseMeasurements, pressureMeasurements, insulinEntries]);

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return "bg-red-500";
    if (value > 200) return "bg-red-500";
    if (value > 140) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPressureStatus = (value: number) => {
    if (value > 140) return "bg-red-500";
    if (value > 130) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resumen de la Semana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Glucemia</h3>
          <p className="text-2xl font-bold text-blue-600">
            {glucoseMeasurements.length}
          </p>
          <p className="text-sm text-blue-600">mediciones esta semana</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Presión</h3>
          <p className="text-2xl font-bold text-red-600">
            {pressureMeasurements.length}
          </p>
          <p className="text-sm text-red-600">mediciones esta semana</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Insulina</h3>
          <p className="text-2xl font-bold text-purple-600">
            {insulinEntries.length}
          </p>
          <p className="text-sm text-purple-600">aplicaciones esta semana</p>
        </div>
      </div>

      {/* Gráfico de Glucemia Semanal */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Glucemia - Promedio Diario
        </h3>
        <div className="space-y-3">
          {weekData.map((day) => (
            <div
              key={day.date.toISOString()}
              className="flex items-center space-x-3"
            >
              <div className="w-16 text-sm font-medium text-gray-600">
                {day.dayName}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                {day.glucoseAvg && (
                  <>
                    <div
                      className={`h-8 rounded-full transition-all duration-300 ${getGlucoseStatus(
                        day.glucoseAvg
                      )}`}
                      style={{
                        width: `${Math.min(
                          (day.glucoseAvg / 300) * 100,
                          100
                        )}%`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {Math.round(day.glucoseAvg)}
                    </span>
                  </>
                )}
              </div>
              <div className="w-20 text-right text-sm text-gray-600">
                {day.glucose.length} mediciones
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Normal (70-140)
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mx-2"></span>
          Elevada (140-200)
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mx-2"></span>
          Crítica (&gt;200 o &lt;70)
        </div>
      </div>

      {/* Gráfico de Presión Semanal */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Presión Sistólica - Promedio Diario
        </h3>
        <div className="space-y-3">
          {weekData.map((day) => (
            <div
              key={day.date.toISOString()}
              className="flex items-center space-x-3"
            >
              <div className="w-16 text-sm font-medium text-gray-600">
                {day.dayName}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                {day.pressureAvg && (
                  <>
                    <div
                      className={`h-8 rounded-full transition-all duration-300 ${getPressureStatus(
                        day.pressureAvg
                      )}`}
                      style={{
                        width: `${Math.min(
                          (day.pressureAvg / 200) * 100,
                          100
                        )}%`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {Math.round(day.pressureAvg)}
                    </span>
                  </>
                )}
              </div>
              <div className="w-20 text-right text-sm text-gray-600">
                {day.pressure.length} mediciones
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Normal (&lt;130)
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mx-2"></span>
          Elevada (130-140)
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mx-2"></span>
          Alta (&gt;140)
        </div>
      </div>

      {/* Actividad Diaria */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Actividad Diaria
        </h3>
        <div className="space-y-3">
          {weekData.map((day) => (
            <div
              key={day.date.toISOString()}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-16 text-sm font-medium text-gray-600">
                  {day.dayName}
                </div>
                <div className="flex space-x-2">
                  {day.glucose.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      📊 {day.glucose.length}
                    </span>
                  )}
                  {day.pressure.length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      ❤️ {day.pressure.length}
                    </span>
                  )}
                  {day.insulin.length > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      💉 {day.insulin.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {day.glucose.length + day.pressure.length + day.insulin.length}{" "}
                total
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
