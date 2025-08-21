import { useState } from "react";
import { Button } from "./atoms/Button";
import { Input } from "./atoms/Input";
import { Label } from "./atoms/Label";

interface PressureMeasurementFormProps {
  readonly onSubmit: (
    systolic: number,
    diastolic: number,
    customDate?: Date
  ) => void;
  readonly onCancel: () => void;
  readonly criticalLimits: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
  };
  readonly initialSystolic?: number;
  readonly initialDiastolic?: number;
  readonly initialDate?: Date;
  readonly isEditing?: boolean;
}

export function PressureMeasurementForm({
  onSubmit,
  onCancel,
  criticalLimits,
  initialSystolic,
  initialDiastolic,
  initialDate,
  isEditing = false,
}: PressureMeasurementFormProps) {
  const [systolic, setSystolic] = useState(initialSystolic?.toString() || "");
  const [diastolic, setDiastolic] = useState(
    initialDiastolic?.toString() || ""
  );

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

    const systolicValue = parseFloat(systolic);
    const diastolicValue = parseFloat(diastolic);

    if (isNaN(systolicValue) || isNaN(diastolicValue)) {
      setError("Por favor ingrese valores válidos");
      return;
    }

    if (systolicValue <= 0 || diastolicValue <= 0) {
      setError("Los valores deben ser positivos");
      return;
    }

    if (systolicValue < diastolicValue) {
      setError("La presión alta no puede ser menor que la baja");
      return;
    }

    if (systolicValue > 300 || diastolicValue > 200) {
      setError("Los valores parecen ser muy altos. ¿Está seguro?");
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
    onSubmit(systolicValue, diastolicValue, customDate);
  };

  const getStatusColor = (systolic: number, diastolic: number) => {
    const systolicStatus = getSystolicStatus(systolic);
    const diastolicStatus = getDiastolicStatus(diastolic);

    if (systolicStatus === "critical" || diastolicStatus === "critical") {
      return "text-red-600";
    } else if (systolicStatus === "warning" || diastolicStatus === "warning") {
      return "text-yellow-600";
    } else {
      return "text-green-600";
    }
  };

  const getStatusEmoji = (systolic: number, diastolic: number) => {
    const systolicStatus = getSystolicStatus(systolic);
    const diastolicStatus = getDiastolicStatus(diastolic);

    if (systolicStatus === "critical" || diastolicStatus === "critical") {
      return "🔴";
    } else if (systolicStatus === "warning" || diastolicStatus === "warning") {
      return "🟡";
    } else {
      return "🟢";
    }
  };

  const getStatusText = (systolic: number, diastolic: number) => {
    const systolicStatus = getSystolicStatus(systolic);
    const diastolicStatus = getDiastolicStatus(diastolic);

    if (systolicStatus === "critical" || diastolicStatus === "critical") {
      return "Crítico";
    } else if (systolicStatus === "warning" || diastolicStatus === "warning") {
      return "Atención";
    } else {
      return "Normal";
    }
  };

  const getSystolicStatus = (
    value: number
  ): "normal" | "warning" | "critical" => {
    if (
      value >= criticalLimits.systolic.min &&
      value <= criticalLimits.systolic.max
    ) {
      return "normal";
    } else if (
      (value >= criticalLimits.systolic.min * 0.9 &&
        value < criticalLimits.systolic.min) ||
      (value > criticalLimits.systolic.max &&
        value <= criticalLimits.systolic.max * 1.2)
    ) {
      return "warning";
    } else {
      return "critical";
    }
  };

  const getDiastolicStatus = (
    value: number
  ): "normal" | "warning" | "critical" => {
    if (
      value >= criticalLimits.diastolic.min &&
      value <= criticalLimits.diastolic.max
    ) {
      return "normal";
    } else if (
      (value >= criticalLimits.diastolic.min * 0.9 &&
        value < criticalLimits.diastolic.min) ||
      (value > criticalLimits.diastolic.max &&
        value <= criticalLimits.diastolic.max * 1.2)
    ) {
      return "warning";
    } else {
      return "critical";
    }
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Presión Sistólica (Alta) */}
      <div className="space-y-2">
        <Label htmlFor="systolic-value" required>
          Presión Alta (mmHg)
        </Label>
        <Input
          id="systolic-value"
          type="number"
          value={systolic}
          onChange={(e) => {
            setSystolic(e.target.value);
            clearError();
          }}
          placeholder="120"
          className="w-full px-4 py-3 text-xl text-center"
          min="0"
          max="300"
          step="1"
          required
        />
        <p className="text-xs text-gray-500">
          Presión cuando el corazón late (número superior)
        </p>
      </div>

      {/* Presión Diastólica (Baja) */}
      <div className="space-y-2">
        <Label htmlFor="diastolic-value" required>
          Presión Baja (mmHg)
        </Label>
        <Input
          id="diastolic-value"
          type="number"
          value={diastolic}
          onChange={(e) => {
            setDiastolic(e.target.value);
            clearError();
          }}
          placeholder="80"
          className="w-full px-4 py-3 text-xl text-center"
          min="0"
          max="200"
          step="1"
          required
        />
        <p className="text-xs text-gray-500">
          Presión cuando el corazón descansa (número inferior)
        </p>
      </div>

      {/* Estado visual */}
      {systolic && diastolic && !error && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div
            className={`text-3xl font-bold ${getStatusColor(
              parseFloat(systolic),
              parseFloat(diastolic)
            )}`}
          >
            {getStatusEmoji(parseFloat(systolic), parseFloat(diastolic))}{" "}
            {getStatusText(parseFloat(systolic), parseFloat(diastolic))}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Límites: {criticalLimits.systolic.min}/
            {criticalLimits.diastolic.min} - {criticalLimits.systolic.max}/
            {criticalLimits.diastolic.max} mmHg
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Fecha y hora */}
      <div className="space-y-2">
        <Label htmlFor="pressure-date">Fecha y hora:</Label>
        <Input
          id="pressure-date"
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
        <Button
          type="submit"
          disabled={!systolic.trim() || !diastolic.trim()}
          className="flex-1"
        >
          {isEditing ? "Actualizar" : "Registrar"} Presión
        </Button>
      </div>
    </form>
  );
}
