import {
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
  UserMedication,
} from "../../types/health";

interface UnifiedEntryCardProps {
  entry: {
    type: "glucose" | "pressure" | "insulin" | "medication";
    data:
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
      | UserMedication;
    time: string;
    date?: string; // YYYY-MM-DD format
  };
  onEditEntry: (
    type: "glucose" | "pressure" | "insulin" | "medication",
    data:
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
      | UserMedication
  ) => void;
}

export function UnifiedEntryCard({
  entry,
  onEditEntry,
}: UnifiedEntryCardProps) {
  const formatDate = (dateString: string) => {
    // Crear fecha local a partir del string YYYY-MM-DD
    const [year, month, day] = dateString.split("-").map(Number);
    const entryDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexed months

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Comparar solo la fecha (sin hora)
    const entryDateOnly = new Date(
      entryDate.getFullYear(),
      entryDate.getMonth(),
      entryDate.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (entryDateOnly.getTime() === todayOnly.getTime()) {
      return "Hoy";
    } else if (entryDateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Ayer";
    } else {
      return entryDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getFoodRelationText = (
    withFood: "before" | "after" | "during" | "none"
  ) => {
    switch (withFood) {
      case "before":
        return "Antes de comer";
      case "after":
        return "Después de comer";
      case "during":
        return "Durante la comida";
      case "none":
        return "Sin relación con comida";
      default:
        return "";
    }
  };

  switch (entry.type) {
    case "glucose": {
      const data = entry.data as GlucoseMeasurement;
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                Glucemia:{" "}
                <span
                  className={
                    data.status === "normal"
                      ? "text-green-600"
                      : data.status === "warning"
                      ? "text-orange-600"
                      : "text-red-600"
                  }
                >
                  {data.value} mg/dL
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {entry.date && (
                  <span className="mr-2">{formatDate(entry.date)}</span>
                )}
                🕐 {entry.time}
              </div>
            </div>
            <button
              onClick={() => onEditEntry("glucose", data)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Editar
            </button>
          </div>
        </div>
      );
    }

    case "pressure": {
      const data = entry.data as PressureMeasurement;
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">❤️</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                Presión:{" "}
                <span
                  className={
                    data.status === "normal"
                      ? "text-green-600"
                      : data.status === "warning"
                      ? "text-orange-600"
                      : "text-red-600"
                  }
                >
                  {data.systolic}/{data.diastolic} mmHg
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {entry.date && (
                  <span className="mr-2">📅 {formatDate(entry.date)}</span>
                )}
                🕐 {entry.time}
              </div>
            </div>
            <button
              onClick={() => onEditEntry("pressure", data)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Editar
            </button>
          </div>
        </div>
      );
    }

    case "insulin": {
      const data = entry.data as InsulinEntry;
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💉</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">
                Insulina: {data.dose} unidades
              </div>
              <div className="text-sm text-gray-600">
                {entry.date && (
                  <span className="mr-2">📅 {formatDate(entry.date)}</span>
                )}
                🕐 {entry.time}
              </div>
            </div>
            <button
              onClick={() => onEditEntry("insulin", data)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Editar
            </button>
          </div>
        </div>
      );
    }

    case "medication": {
      const data = entry.data as UserMedication;
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💊</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{data.name}</div>
              <div className="text-sm text-gray-600">
                {getFoodRelationText(data.withFood)}
                {entry.date && (
                  <span className="mx-2">• 📅 {formatDate(entry.date)}</span>
                )}
                • 🕐 {entry.time}
              </div>
            </div>
            <button
              onClick={() => onEditEntry("medication", data)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Editar
            </button>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
