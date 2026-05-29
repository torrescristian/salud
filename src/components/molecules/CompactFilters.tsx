import { useState, useEffect } from "react";
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

export interface CompactFiltersProps {
  onPeriodChange: (
    period: FilterPeriod,
    startDate: Date,
    endDate: Date,
  ) => void;
  currentDate?: Date;
  className?: string;
}

export const CompactFilters = ({
  onPeriodChange,
  currentDate,
  className = "",
}: CompactFiltersProps) => {
  const today = currentDate
    ? createLocalDate(currentDate)
    : getCurrentDateLocal();
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("week");
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0],
  );
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Generar opciones de semanas (últimas 8 semanas para ser más compacto)
  const weekOptions = eachWeekOfInterval(
    {
      start: subWeeks(today, 8),
      end: today,
    },
    { weekStartsOn: 1 },
  ).map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const value = weekStart.toISOString().split("T")[0];
    const label = `${format(weekStart, "d MMM", {
      locale: es,
    })} - ${format(weekEnd, "d MMM", { locale: es })}`;
    return { value, label };
  });

  // Generar opciones de meses (últimos 6 meses para ser más compacto)
  const monthOptions = eachMonthOfInterval({
    start: subMonths(today, 6),
    end: today,
  }).map((monthStart) => {
    const value = monthStart.toISOString().split("T")[0];
    const label = format(monthStart, "MMM yyyy", { locale: es });
    return { value, label };
  });

  // Calcular fechas y notificar cambios
  useEffect(() => {
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case "day":
        if (selectedDate) {
          const dateObj = createLocalDate(selectedDate);
          if (!isNaN(dateObj.getTime())) {
            startDate = dateObj;
            endDate = dateObj;
          } else {
            startDate = today;
            endDate = today;
          }
        } else {
          startDate = today;
          endDate = today;
        }
        break;
      case "week":
        if (selectedWeek) {
          const weekDateObj = createLocalDate(selectedWeek);
          if (!isNaN(weekDateObj.getTime())) {
            startDate = startOfWeek(weekDateObj, { weekStartsOn: 1 });
            endDate = endOfWeek(weekDateObj, { weekStartsOn: 1 });
          } else {
            startDate = startOfWeek(today, { weekStartsOn: 1 });
            endDate = endOfWeek(today, { weekStartsOn: 1 });
          }
        } else {
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
        }
        break;
      case "month":
        if (selectedMonth) {
          const monthDateObj = createLocalDate(selectedMonth);
          if (!isNaN(monthDateObj.getTime())) {
            startDate = startOfMonth(monthDateObj);
            endDate = endOfMonth(monthDateObj);
          } else {
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
          }
        } else {
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
        }
        break;
    }

    onPeriodChange(selectedPeriod, startDate, endDate);
  }, [
    selectedPeriod,
    selectedDate,
    selectedWeek,
    selectedMonth,
    onPeriodChange,
  ]);

  const handlePeriodChange = (period: FilterPeriod) => {
    setSelectedPeriod(period);
    if (period === "day") {
      if (!selectedDate) {
        setSelectedDate(today.toISOString().split("T")[0]);
      }
      setSelectedWeek("");
      setSelectedMonth("");
    } else if (period === "week") {
      setSelectedDate("");
      setSelectedMonth("");
    } else if (period === "month") {
      setSelectedDate("");
      setSelectedWeek("");
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border ${className}`}>
      {/* Selector de Período - Más compacto */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-600 min-w-fit">📅</span>
        <div className="flex gap-1 flex-1">
          {(["day", "week", "month"] as const).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`flex-1 py-2 px-3 text-sm rounded-md font-medium transition-colors ${
                selectedPeriod === period
                  ? "bg-blue-600 text-white"
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

      {/* Selector específico - Compacto */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 min-w-fit">
          {selectedPeriod === "day" && "🗓️"}
          {selectedPeriod === "week" && "📅"}
          {selectedPeriod === "month" && "🗓️"}
        </span>

        {selectedPeriod === "day" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}

        {selectedPeriod === "week" && (
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semana actual</option>
            {weekOptions.map((week) => (
              <option key={week.value} value={week.value}>
                {week.label}
              </option>
            ))}
          </select>
        )}

        {selectedPeriod === "month" && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Mes actual</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
