import { useState } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";
import { RadioGroup } from "./RadioGroup";

export interface MedicationEntryFormProps {
  onSubmit: (
    medicationName: string,
    withFood: "before" | "during" | "after" | "none",
    customDate?: Date
  ) => void;
  onCancel: () => void;
  suggestions: Array<{ name: string; usageCount: number }>;
  placeholder?: string;
  initialMedicationName?: string;
  initialWithFood?: "before" | "during" | "after" | "none";
  initialDate?: Date;
  isEditing?: boolean;
}

const foodRelationOptions = [
  {
    value: "before",
    label: "Antes",
    description: "Tomar antes de comer",
    icon: "🍽️⬅️",
  },
  {
    value: "during",
    label: "Durante",
    description: "Tomar durante la comida",
    icon: "🍽️⬇️",
  },
  {
    value: "after",
    label: "Después",
    description: "Tomar después de comer",
    icon: "🍽️➡️",
  },
  {
    value: "none",
    label: "Ninguna",
    description: "Sin relación con comida",
    icon: "🚫",
  },
];

export function MedicationEntryForm({
  onSubmit,
  onCancel,
  suggestions,
  placeholder = "Nombre del medicamento...",
  initialMedicationName = "",
  initialWithFood = "none",
  initialDate,
  isEditing = false,
}: MedicationEntryFormProps) {
  const [medicationName, setMedicationName] = useState(initialMedicationName);
  const [withFood, setWithFood] = useState<
    "before" | "during" | "after" | "none"
  >(initialWithFood);

  // Crear fecha inicial sin conversión de zona horaria
  const getInitialDateTime = () => {
    if (initialDate) {
      // Si tenemos una fecha inicial, convertirla a string local
      const year = initialDate.getFullYear();
      const month = String(initialDate.getMonth() + 1).padStart(2, "0");
      const day = String(initialDate.getDate()).padStart(2, "0");
      const hours = String(initialDate.getHours()).padStart(2, "0");
      const minutes = String(initialDate.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Si no hay fecha inicial, usar la fecha y hora actual local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [customDateTime, setCustomDateTime] = useState(getInitialDateTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim()) return;

    // Crear la fecha sin conversión de zona horaria
    const [datePart, timePart] = customDateTime.split("T");
    const [hours, minutes] = timePart.split(":");

    const customDate = new Date();
    customDate.setFullYear(parseInt(datePart.split("-")[0]));
    customDate.setMonth(parseInt(datePart.split("-")[1]) - 1);
    customDate.setDate(parseInt(datePart.split("-")[2]));
    customDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    onSubmit(medicationName.trim(), withFood, customDate);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMedicationName(suggestion);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del medicamento */}
      <div className="space-y-2">
        <Label htmlFor="medication-name" required>
          Nombre del medicamento
        </Label>
        <Input
          id="medication-name"
          type="text"
          value={medicationName}
          onChange={(e) => setMedicationName(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full"
        />

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.name}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.name)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {suggestion.name} ({suggestion.usageCount})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Relación con comida */}
      <div className="space-y-3">
        <Label>Relación con comida:</Label>
        <RadioGroup
          name="food-relation"
          value={withFood}
          onChange={(value) =>
            setWithFood(value as "before" | "after" | "during" | "none")
          }
          options={foodRelationOptions}
          layout="grid"
        />
      </div>

      {/* Fecha y hora */}
      <div className="space-y-2">
        <Label htmlFor="medication-date">Fecha y hora:</Label>
        <Input
          id="medication-date"
          type="datetime-local"
          value={customDateTime}
          onChange={(e) => setCustomDateTime(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {isEditing ? "Actualizar" : "Registrar"} Medicación
        </Button>
      </div>
    </form>
  );
}
