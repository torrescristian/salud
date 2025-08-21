import {
  DailyEntry,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";
import { EntryCard } from "../molecules/EntryCard";
import { StatusIndicator } from "../atoms/StatusIndicator";

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

export function DailySummary({ entries, onEditEntry }: DailySummaryProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          HOY - Resumen
        </h2>
        <p className="text-gray-500 text-center py-8">
          No hay registros para hoy. ¡Comienza agregando tu primera medicación o
          medición!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        HOY - Resumen
      </h2>

      <div className="space-y-4">
        {entries.map((entry, index) => {
          switch (entry.type) {
            case "medication": {
              const data = entry.data as UserMedication;
              return (
                <EntryCard
                  key={index}
                  time={entry.time}
                  icon="✅"
                  title={data.name}
                  subtitle={`(${getFoodRelationText(data.withFood)})`}
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
                  status={<StatusIndicator status={data.status} />}
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
                  status={<StatusIndicator status={data.status} />}
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
                  title={`Insulina: ${data.dose} unidades (${data.type})`}
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
