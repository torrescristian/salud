import { useState, useEffect, useCallback, useRef } from "react";
import {
  DailyEntry,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";
import { UnifiedEntryCard } from "../molecules/UnifiedEntryCard";

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
      <div className="space-y-3">
        {displayedEntries.map((entry, index) => {
          const isLast = index === displayedEntries.length - 1;

          if (isLast) {
            return (
              <div
                key={`${entry.type}-${entry.data.id}-${index}`}
                ref={lastEntryRef}
              >
                <UnifiedEntryCard entry={entry} onEditEntry={onEditEntry} />
              </div>
            );
          }

          return (
            <div key={`${entry.type}-${entry.data.id}-${index}`}>
              <UnifiedEntryCard entry={entry} onEditEntry={onEditEntry} />
            </div>
          );
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
