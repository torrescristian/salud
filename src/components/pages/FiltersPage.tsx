import { useState, useCallback } from "react";
import { CompactFilters, FilterPeriod } from "../molecules/CompactFilters";
import { UnifiedEntryCard } from "../molecules/UnifiedEntryCard";
import {
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";

interface FiltersPageProps {
  entries: Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    date: string;
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }>;
  onEditEntry: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
  ) => void;
}

export const FiltersPage = ({ entries, onEditEntry }: FiltersPageProps) => {
  const [filteredEntries, setFilteredEntries] = useState<typeof entries>([]);

  const handlePeriodChange = useCallback(
    (_period: FilterPeriod, startDate: Date, endDate: Date) => {
      // Filtrar los registros según el período seleccionado
      if (entries.length > 0) {
        const filtered = entries.filter((entry) => {
          const entryDate = new Date(
            "timestamp" in entry.data
              ? entry.data.timestamp
              : entry.data.lastUsed
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
      } else {
        setFilteredEntries([]);
      }
    },
    [entries]
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Filtros Avanzados
        </h2>
        <p className="text-gray-600">Busca y filtra tus registros de salud</p>
      </div>

      {/* Filtros Compactos */}
      <CompactFilters onPeriodChange={handlePeriodChange} />

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
};
