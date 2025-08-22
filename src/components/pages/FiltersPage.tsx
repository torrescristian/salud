import { AdvancedFilters } from "../organisms/AdvancedFilters";

interface FiltersPageProps {
  entries: Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    date: string;
    data: any;
  }>;
  onEditEntry: (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data: any
  ) => void;
}

export const FiltersPage = ({ entries, onEditEntry }: FiltersPageProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Filtros Avanzados
        </h2>
        <p className="text-gray-600">
          Busca y filtra tus registros de salud
        </p>
      </div>
      
      <AdvancedFilters
        entries={entries}
        onEditEntry={onEditEntry}
      />
    </div>
  );
};
