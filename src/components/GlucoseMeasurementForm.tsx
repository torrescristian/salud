import { useState } from "react";

interface GlucoseMeasurementFormProps {
  onSubmit: (
    value: number,
    context: "fasting" | "postprandial" | "custom"
  ) => void;
  onCancel: () => void;
  criticalLimits: { min: number; max: number };
}

export function GlucoseMeasurementForm({
  onSubmit,
  onCancel,
  criticalLimits,
}: GlucoseMeasurementFormProps) {
  const [value, setValue] = useState("");
  const [context, setContext] = useState<"fasting" | "postprandial" | "custom">(
    "fasting"
  );
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

    setError("");
    onSubmit(numericValue, context);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Registrar Glucemia
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (mg/dL):
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder="120"
              className="w-full px-4 py-3 text-xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="1000"
              step="0.1"
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Contexto:
            </label>
            <div className="space-y-2">
              {[
                {
                  value: "fasting" as const,
                  label: "En ayunas",
                  description: "Antes del desayuno, sin comer por 8+ horas",
                },
                {
                  value: "postprandial" as const,
                  label: "Después de comer",
                  description: "2 horas después de una comida",
                },
                {
                  value: "custom" as const,
                  label: "Otro momento",
                  description: "Otro momento del día",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-start space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="context"
                    value={option.value}
                    checked={context === option.value}
                    onChange={(e) =>
                      setContext(
                        e.target.value as "fasting" | "postprandial" | "custom"
                      )
                    }
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
