import { useState, useEffect } from "react";
import { Input } from "../atoms/Input";
import { UnifiedEntryCard } from "../molecules/UnifiedEntryCard";
import {
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";
import {
  getCurrentDateLocal,
  createLocalDate,
} from "../../utils/healthCalculations";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  eachMonthOfInterval,
  subWeeks,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

export type FilterPeriod = "day" | "week" | "month";

export interface AdvancedFiltersProps {
  className?: string;
  entries?: Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }>;
  onEditEntry?: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
  ) => void;
}

export function AdvancedFilters({
  className = "",
  entries = [],
  onEditEntry,
}: AdvancedFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("day");
  const [selectedDate, setSelectedDate] = useState(
    createLocalDate().toISOString().split("T")[0]
  );
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Estado para los registros filtrados
  const [filteredEntries, setFilteredEntries] = useState<typeof entries>([]);

  // Usar useRef para evitar el loop infinito

  // Generar opciones de semanas (últimas 12 semanas)
  const weekOptions = eachWeekOfInterval(
    {
      start: subWeeks(createLocalDate(), 12),
      end: createLocalDate(),
    },
    { weekStartsOn: 1 }
  ).map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const value = weekStart.toISOString().split("T")[0];
    const label = `${format(weekStart, "d 'de' MMM", {
      locale: es,
    })} - ${format(weekEnd, "d 'de' MMM", { locale: es })}`;
    return { value, label };
  });

  // Generar opciones de meses (últimos 12 meses)
  const monthOptions = eachMonthOfInterval({
    start: subMonths(createLocalDate(), 12),
    end: createLocalDate(),
  }).map((monthStart) => {
    const value = monthStart.toISOString().split("T")[0];
    const label = format(monthStart, "MMMM yyyy", { locale: es });
    return { value, label };
  });

  // Filtrado automático cuando cambia el período o la selección
  useEffect(() => {
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case "day":
        // Validar que selectedDate no esté vacío
        if (selectedDate) {
          const dateObj = createLocalDate(selectedDate);
          if (!isNaN(dateObj.getTime())) {
            startDate = dateObj;
            endDate = dateObj;
          } else {
            // Usar fecha actual si la fecha es inválida
            startDate = getCurrentDateLocal();
            endDate = getCurrentDateLocal();
          }
        } else {
          // Usar fecha actual si no hay selectedDate
          startDate = getCurrentDateLocal();
          endDate = getCurrentDateLocal();
        }
        break;
      case "week":
        if (selectedWeek) {
          const weekDateObj = createLocalDate(selectedWeek);
          if (!isNaN(weekDateObj.getTime())) {
            startDate = startOfWeek(weekDateObj, { weekStartsOn: 1 });
            endDate = endOfWeek(weekDateObj, { weekStartsOn: 1 });
          } else {
            // Usar semana actual si la fecha es inválida
            startDate = startOfWeek(getCurrentDateLocal(), { weekStartsOn: 1 });
            endDate = endOfWeek(getCurrentDateLocal(), { weekStartsOn: 1 });
          }
        } else {
          // Semana actual por defecto
          startDate = startOfWeek(getCurrentDateLocal(), { weekStartsOn: 1 });
          endDate = endOfWeek(getCurrentDateLocal(), { weekStartsOn: 1 });
        }
        break;
      case "month":
        if (selectedMonth) {
          const monthDateObj = createLocalDate(selectedMonth);
          if (!isNaN(monthDateObj.getTime())) {
            startDate = startOfMonth(monthDateObj);
            endDate = endOfMonth(monthDateObj);
          } else {
            // Usar mes actual si la fecha es inválida
            startDate = startOfMonth(getCurrentDateLocal());
            endDate = endOfMonth(getCurrentDateLocal());
          }
        } else {
          // Mes actual por defecto
          startDate = startOfMonth(getCurrentDateLocal());
          endDate = endOfMonth(getCurrentDateLocal());
        }
        break;
    }

    // Filtrar los registros localmente
    if (entries.length > 0) {
      const filtered = entries.filter((entry) => {
        const entryDate = new Date(
          "timestamp" in entry.data ? entry.data.timestamp : entry.data.lastUsed
        );
        // Ajustar las fechas de comparación para usar solo la fecha (sin hora)
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
      setFilteredEntries(filtered);
    }
  }, [selectedPeriod, selectedDate, selectedWeek, selectedMonth, entries]);

  const handlePeriodChange = (period: FilterPeriod) => {
    setSelectedPeriod(period);
    // Resetear selecciones específicas cuando cambia el período
    if (period === "day") {
      // Establecer fecha actual si no hay una fecha válida
      if (!selectedDate) {
        setSelectedDate(createLocalDate().toISOString().split("T")[0]);
      }
      setSelectedWeek("");
      setSelectedMonth("");
    } else if (period === "week") {
      setSelectedDate("");
      setSelectedMonth("");
      // No establecer selectedWeek automáticamente, dejar que use semana actual
    } else if (period === "month") {
      setSelectedDate("");
      setSelectedWeek("");
      // No establecer selectedMonth automáticamente, dejar que use mes actual
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    if (start.toDateString() === end.toDateString()) {
      return format(start, "EEEE, d 'de' MMMM", { locale: es });
    }
    return `${format(start, "d 'de' MMM", { locale: es })} - ${format(
      end,
      "d 'de' MMM",
      { locale: es }
    )}`;
  };

  const getCurrentPeriodDates = () => {
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case "day":
        // Validar que selectedDate no esté vacío
        if (selectedDate) {
          const dateObj = createLocalDate(selectedDate);
          if (!isNaN(dateObj.getTime())) {
            startDate = dateObj;
            endDate = dateObj;
          } else {
            // Usar fecha actual si la fecha es inválida
            startDate = createLocalDate();
            endDate = createLocalDate();
          }
        } else {
          // Usar fecha actual si no hay selectedDate
          startDate = createLocalDate();
          endDate = createLocalDate();
        }
        break;
      case "week":
        if (selectedWeek) {
          const weekDateObj = createLocalDate(selectedWeek);
          if (!isNaN(weekDateObj.getTime())) {
            startDate = startOfWeek(weekDateObj, { weekStartsOn: 1 });
            endDate = endOfWeek(weekDateObj, { weekStartsOn: 1 });
          } else {
            // Usar semana actual si la fecha es inválida
            startDate = startOfWeek(createLocalDate(), { weekStartsOn: 1 });
            endDate = endOfWeek(createLocalDate(), { weekStartsOn: 1 });
          }
        } else {
          startDate = startOfWeek(getCurrentDateLocal(), { weekStartsOn: 1 });
          endDate = endOfWeek(getCurrentDateLocal(), { weekStartsOn: 1 });
        }
        break;
      case "month":
        if (selectedMonth) {
          const monthDateObj = createLocalDate(selectedMonth);
          if (!isNaN(monthDateObj.getTime())) {
            startDate = startOfMonth(monthDateObj);
            endDate = endOfMonth(monthDateObj);
          } else {
            // Usar mes actual si la fecha es inválida
            startDate = startOfMonth(getCurrentDateLocal());
            endDate = endOfMonth(getCurrentDateLocal());
          }
        } else {
          startDate = startOfMonth(getCurrentDateLocal());
          endDate = endOfMonth(getCurrentDateLocal());
        }
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getCurrentPeriodDates();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selector de Período */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Tipo de Período</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["day", "week", "month"] as const).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {period === "day" && "Día"}
              {period === "week" && "Semana"}
              {period === "month" && "Mes"}
            </button>
          ))}
        </div>
      </div>

      {/* Selector específico según el período */}
      {selectedPeriod === "day" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Seleccionar Fecha
          </h3>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {selectedPeriod === "week" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Seleccionar Semana
          </h3>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semana actual</option>
            {weekOptions.map((week) => (
              <option key={week.value} value={week.value}>
                {week.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPeriod === "month" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Seleccionar Mes
          </h3>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Mes actual</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Resumen del Período Seleccionado */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Período Actual</h4>
        <p className="text-blue-700">{formatDateRange(startDate, endDate)}</p>
        <p className="text-sm text-blue-600 mt-1">
          {selectedPeriod === "day" && "Viendo registros de un día específico"}
          {selectedPeriod === "week" && "Viendo registros de toda la semana"}
          {selectedPeriod === "month" && "Viendo registros de todo el mes"}
        </p>
      </div>

      {/* Resultados Filtrados */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Registros Encontrados ({filteredEntries.length})
        </h3>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron registros para el período seleccionado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => (
              <UnifiedEntryCard
                key={`${entry.type}-${entry.data.id}-${index}`}
                entry={entry}
                onEditEntry={onEditEntry || (() => {})}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
