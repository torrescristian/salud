import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  DailyEntry,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";
import { EntryCard } from "../molecules/EntryCard";

export interface EntriesByDayProps {
  entries: DailyEntry["entries"];
  onEditEntry: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
  ) => void;
  className?: string;
}

// Funciones auxiliares para obtener texto de relación con comida
function getFoodRelationText(withFood: string): string {
  switch (withFood) {
    case "before":
      return "antes de comer";
    case "during":
      return "durante la comida";
    case "after":
      return "después de comer";
    case "none":
      return "sin relación con comida";
    default:
      return "";
  }
}

export function EntriesByDay({
  entries,
  onEditEntry,
  className = "",
}: EntriesByDayProps) {
  // Agrupar entradas por día
  const entriesByDay = useMemo(() => {
    const groups: { [key: string]: DailyEntry["entries"] } = {};

    entries.forEach((entry) => {
      // Los repositorios ya convierten los timestamps a local, no necesitamos convertirlos de nuevo
      const entryDate =
        "timestamp" in entry.data ? entry.data.timestamp : entry.data.lastUsed;

      // Usar fecha local en lugar de UTC para evitar problemas de zona horaria
      const dateKey = `${entryDate.getFullYear()}-${String(
        entryDate.getMonth() + 1
      ).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    // Ordenar por fecha (más reciente primero)
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dayEntries]) => ({
        date,
        entries: dayEntries.sort((a, b) => {
          // Los repositorios ya convierten los timestamps a local
          const timeA =
            "timestamp" in a.data ? a.data.timestamp : a.data.lastUsed;
          const timeB =
            "timestamp" in b.data ? b.data.timestamp : b.data.lastUsed;
          return timeB.getTime() - timeA.getTime();
        }),
      }));
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No hay registros
        </h3>
        <p className="text-gray-500">
          Comienza agregando tu primera medicación o medición
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Registros por Día
        </h2>
        <p className="text-gray-600">{entries.length} registros en total</p>
      </div>

      {entriesByDay.map(({ date, entries: dayEntries }) => {
        // Crear fecha local desde el string date para evitar problemas de timezone
        const [year, month, day] = date.split("-").map(Number);
        const localDate = new Date(year, month - 1, day);

        const isToday = isSameDay(localDate, new Date());
        const displayDate = isToday
          ? "Hoy"
          : format(localDate, "EEEE, d 'de' MMMM", { locale: es });

        return (
          <div key={date} className="space-y-4">
            {/* Header del día */}
            <div className="flex items-center space-x-3">
              <div
                className={`text-lg font-semibold ${
                  isToday ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {displayDate}
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div className="text-sm text-gray-500">
                {dayEntries.length} registro{dayEntries.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Entradas del día */}
            <div className="space-y-3">
              {dayEntries.map((entry, index) => {
                switch (entry.type) {
                  case "medication": {
                    const data = entry.data as UserMedication;
                    return (
                      <EntryCard
                        key={`${entry.type}-${data.id}-${index}`}
                        time={entry.time}
                        icon="💊"
                        title={data.name}
                        subtitle={`${getFoodRelationText(data.withFood)}`}
                        statusType="normal"
                        onEdit={() => onEditEntry("medication", data)}
                      />
                    );
                  }

                  case "glucose": {
                    const data = entry.data as GlucoseMeasurement;
                    return (
                      <EntryCard
                        key={`${entry.type}-${data.id}-${index}`}
                        time={entry.time}
                        icon="📊"
                        title={`Glucemia: ${data.value} mg/dL`}
                        statusType={data.status}
                        onEdit={() => onEditEntry("glucose", data)}
                      />
                    );
                  }

                  case "pressure": {
                    const data = entry.data as PressureMeasurement;
                    return (
                      <EntryCard
                        key={`${entry.type}-${data.id}-${index}`}
                        time={entry.time}
                        icon="❤️"
                        title={`Presión: ${data.systolic}/${data.diastolic} mmHg`}
                        statusType={data.status}
                        onEdit={() => onEditEntry("pressure", data)}
                      />
                    );
                  }

                  case "insulin": {
                    const data = entry.data as InsulinEntry;
                    return (
                      <EntryCard
                        key={`${entry.type}-${data.id}-${index}`}
                        time={entry.time}
                        icon="💉"
                        title={`Insulina: ${data.dose} unidades`}
                        subtitle={`(${data.type})`}
                        statusType="normal"
                        onEdit={() => onEditEntry("insulin", data)}
                      />
                    );
                  }

                  default:
                    return null;
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
