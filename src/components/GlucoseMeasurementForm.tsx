import { useState } from "react";
import { Button } from "./atoms/Button";
import { Input } from "./atoms/Input";
import { Label } from "./atoms/Label";
import { RadioGroup } from "./molecules/RadioGroup";

type GlucoseContext = "fasting" | "postprandial" | "custom";

interface GlucoseMeasurementFormProps {
  readonly onSubmit: (
    value: number,
    context: GlucoseContext,
    customDate?: Date
  ) => void;
  readonly onCancel: () => void;
  readonly criticalLimits: { min: number; max: number };
  readonly initialValue?: number;
  readonly initialContext?: GlucoseContext;
  readonly initialDate?: Date;
  readonly isEditing?: boolean;
}

const contextOptions = [
  {
    value: "fasting",
    label: "En ayunas",
    description: "Antes del desayuno, sin comer por 8+ horas",
    icon: "🌅",
  },
  {
    value: "postprandial",
    label: "Después de comer",
    description: "2 horas después de una comida",
    icon: "🍽️",
  },
  {
    value: "custom",
    label: "Otro momento",
    description: "Otro momento del día",
    icon: "⏰",
  },
];

export function GlucoseMeasurementForm({
  onSubmit,
  onCancel,
  criticalLimits,
  initialValue,
  initialContext = "fasting",
  initialDate,
  isEditing = false,
}: GlucoseMeasurementFormProps) {
  const [value, setValue] = useState(initialValue?.toString() || "");
  const [context, setContext] = useState<GlucoseContext>(initialContext);

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

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setError("Por favor ingrese un valor válido");
      return;
    }

    if (numericValue > 1000) {
      setError("El valor parece ser muy alto. ¿Está seguro?");
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
    onSubmit(numericValue, context, customDate);
  };

  const getStatusColor = (value: number) => {
    if (value >= criticalLimits.min && value <= criticalLimits.max) {
      return "text-green-600";
    } else if (
      (value >= criticalLimits.min * 0.9 && value < criticalLimits.min) ||
      (value > criticalLimits.max && value <= criticalLimits.max * 1.2)
    ) {
      return "text-yellow-600";
    } else {
      return "text-red-600";
    }
  };

  const getStatusEmoji = (value: number) => {
    if (value >= criticalLimits.min && value <= criticalLimits.max) {
      return "🟢";
    } else if (
      (value >= criticalLimits.min * 0.9 && value < criticalLimits.min) ||
      (value > criticalLimits.max && value <= criticalLimits.max * 1.2)
    ) {
      return "🟡";
    } else {
      return "🔴";
    }
  };

  const getStatusText = (value: number) => {
    if (value >= criticalLimits.min && value <= criticalLimits.max) {
      return "Normal";
    } else if (
      (value >= criticalLimits.min * 0.9 && value < criticalLimits.min) ||
      (value > criticalLimits.max && value <= criticalLimits.max * 1.2)
    ) {
      return "Atención";
    } else {
      return "Crítico";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de valor */}
      <div className="space-y-2">
        <Label htmlFor="glucose-value" required>
          Valor (mg/dL)
        </Label>
        <Input
          id="glucose-value"
          type="number"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder="120"
          className="w-full px-4 py-3 text-xl text-center"
          min="0"
          max="1000"
          step="0.1"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Estado visual */}
      {value && !error && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div
            className={`text-3xl font-bold ${getStatusColor(
              parseFloat(value)
            )}`}
          >
            {getStatusEmoji(parseFloat(value))}{" "}
            {getStatusText(parseFloat(value))}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Límites: {criticalLimits.min} - {criticalLimits.max} mg/dL
          </div>
        </div>
      )}

      {/* Contexto */}
      <div className="space-y-3">
        <Label>Contexto:</Label>
        <RadioGroup
          name="glucose-context"
          value={context}
          onChange={(value) => setContext(value as GlucoseContext)}
          options={contextOptions}
          layout="vertical"
        />
      </div>

      {/* Fecha y hora */}
      <div className="space-y-2">
        <Label htmlFor="glucose-date">Fecha y hora:</Label>
        <Input
          id="glucose-date"
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
        <Button type="submit" disabled={!value.trim()} className="flex-1">
          {isEditing ? "Actualizar" : "Registrar"} Glucemia
        </Button>
      </div>
    </form>
  );
}
