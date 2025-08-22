import {
  DailyEntry,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";
import { EntryCard } from "../molecules/EntryCard";

export interface DailySummaryProps {
  entries: DailyEntry["entries"];
  onEditEntry: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
  ) => void;
  date?: string;
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

export function DailySummary({
  entries,
  onEditEntry,
  date,
}: DailySummaryProps) {
  const isToday = date
    ? new Date(date).toDateString() === new Date().toDateString()
    : true;
  const title = isToday ? "HOY - Resumen" : `${date} - Resumen`;

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-500 text-center py-8">
          {isToday
            ? "No hay registros para hoy. ¡Comienza agregando tu primera medicación o medición!"
            : "No hay registros para esta fecha."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>

      <div className="space-y-4">
        {entries.map((entry, index) => {
          switch (entry.type) {
            case "medication": {
              const data = entry.data as UserMedication;
              return (
                <EntryCard
                  key={index}
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
                  key={index}
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
                  key={index}
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
                  key={index}
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
}
