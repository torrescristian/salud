import { useState } from "react";
import { Button } from "./atoms/Button";
import { Input } from "./atoms/Input";
import { Label } from "./atoms/Label";
import { RadioGroup } from "./molecules/RadioGroup";

type InsulinType = "rapid" | "long" | "mixed";
type InsulinContext = "fasting" | "postprandial" | "correction";

interface InsulinEntryFormProps {
  readonly onSubmit: (
    dose: number,
    type: InsulinType,
    context: InsulinContext,
    notes?: string,
    customDate?: Date
  ) => void;
  readonly onCancel: () => void;
  readonly initialDose?: number;
  readonly initialType?: InsulinType;
  readonly initialContext?: InsulinContext;
  readonly initialNotes?: string;
  readonly initialDate?: Date;
  readonly isEditing?: boolean;
}

const insulinTypeOptions = [
  {
    value: "rapid",
    label: "Rápida",
    description: "Actúa en 15-30 minutos",
    icon: "⚡",
  },
  {
    value: "long",
    label: "Lenta",
    description: "Actúa en 1-2 horas, dura 12-24h",
    icon: "🐌",
  },
  {
    value: "mixed",
    label: "Mixta",
    description: "Combinación de rápida y lenta",
    icon: "🔄",
  },
];

const contextOptions = [
  {
    value: "fasting",
    label: "En ayunas",
    description: "Antes del desayuno",
    icon: "🌅",
  },
  {
    value: "postprandial",
    label: "Después de comer",
    description: "Para controlar glucemia postprandial",
    icon: "🍽️",
  },
  {
    value: "correction",
    label: "Corrección",
    description: "Para bajar glucemia alta",
    icon: "🎯",
  },
];

export function InsulinEntryForm({
  onSubmit,
  onCancel,
  initialDose,
  initialType = "rapid",
  initialContext = "fasting",
  initialNotes = "",
  initialDate,
  isEditing = false,
}: InsulinEntryFormProps) {
  const [dose, setDose] = useState(initialDose?.toString() || "");
  const [type, setType] = useState<InsulinType>(initialType);
  const [context, setContext] = useState<InsulinContext>(initialContext);
  const [notes, setNotes] = useState(initialNotes);
  const [showNotes, setShowNotes] = useState(!!initialNotes);

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
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericDose = parseFloat(dose);
    if (isNaN(numericDose) || numericDose <= 0) {
      setError("Por favor ingrese una dosis válida");
      return;
    }

    if (numericDose > 100) {
      setError("La dosis parece ser muy alta. ¿Está seguro?");
      return;
    }

    // Crear la fecha sin conversión de zona horaria
    const [datePart, timePart] = customDateTime.split("T");
    const [hours, minutes] = timePart.split(":");

    const customDate = new Date();
    customDate.setFullYear(parseInt(datePart.split("-")[0]));
    customDate.setMonth(parseInt(datePart.split("-")[1]) - 1);
    customDate.setDate(parseInt(datePart.split("-")[2]));
    customDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setError("");
    onSubmit(numericDose, type, context, notes.trim() || undefined, customDate);
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dosis */}
      <div className="space-y-2">
        <Label htmlFor="insulin-dose" required>
          Dosis (unidades)
        </Label>
        <Input
          id="insulin-dose"
          type="number"
          value={dose}
          onChange={(e) => {
            setDose(e.target.value);
            clearError();
          }}
          placeholder="10"
          className="w-full px-4 py-3 text-xl text-center"
          min="0.1"
          max="100"
          step="0.1"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Tipo de insulina */}
      <div className="space-y-3">
        <Label>Tipo de insulina:</Label>
        <RadioGroup
          name="insulin-type"
          value={type}
          onChange={(value) => setType(value as InsulinType)}
          options={insulinTypeOptions}
          layout="vertical"
        />
      </div>

      {/* Contexto */}
      <div className="space-y-3">
        <Label>Contexto:</Label>
        <RadioGroup
          name="insulin-context"
          value={context}
          onChange={(value) => setContext(value as InsulinContext)}
          options={contextOptions}
          layout="vertical"
        />
      </div>

      {/* Fecha y hora */}
      <div className="space-y-2">
        <Label htmlFor="insulin-date">Fecha y hora:</Label>
        <Input
          id="insulin-date"
          type="datetime-local"
          value={customDateTime}
          onChange={(e) => setCustomDateTime(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Notas opcionales */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showNotes ? "Ocultar notas" : "+ Agregar notas"}
        </button>

        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        )}
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
        <Button type="submit" disabled={!dose.trim()} className="flex-1">
          {isEditing ? "Actualizar" : "Registrar"} Insulina
        </Button>
      </div>
    </form>
  );
}
