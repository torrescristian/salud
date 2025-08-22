import { useState, useEffect, useCallback, useRef } from "react";
import {
  DailyEntry,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";
import { EntryCard } from "../molecules/EntryCard";

export interface AllEntriesListProps {
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

export function AllEntriesList({
  entries,
  onEditEntry,
  className = "",
}: AllEntriesListProps) {
  const [displayedEntries, setDisplayedEntries] = useState<
    DailyEntry["entries"]
  >([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastEntryRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setDisplayedEntries(entries.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(entries.length > ITEMS_PER_PAGE);
  }, [entries]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = 0;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const newEntries = entries.slice(startIndex, endIndex);

      setDisplayedEntries(newEntries);
      setPage(nextPage);
      setHasMore(endIndex < entries.length);
      setLoading(false);
    }, 500); // Simular carga
  }, [loading, hasMore, page, entries]);

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastEntryRef.current) {
      observer.current.observe(lastEntryRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMore]);

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
    <div className={`space-y-4 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Todos los Registros
        </h2>
        <p className="text-gray-600">{entries.length} registros en total</p>
      </div>

      <div className="space-y-3">
        {displayedEntries.map((entry, index) => {
          const isLast = index === displayedEntries.length - 1;

          const entryElement = () => {
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
          };

          if (isLast) {
            return (
              <div key={`${entry.type}-${index}`} ref={lastEntryRef}>
                {entryElement()}
              </div>
            );
          }

          return <div key={`${entry.type}-${index}`}>{entryElement()}</div>;
        })}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Cargando más registros...</p>
        </div>
      )}

      {!hasMore && displayedEntries.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>Has llegado al final de todos los registros</p>
        </div>
      )}
    </div>
  );
}
