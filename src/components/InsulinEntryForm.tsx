import { useState } from "react";

interface InsulinEntryFormProps {
  readonly onSubmit: (
    dose: number,
    type: "rapid" | "long" | "mixed",
    context: "fasting" | "postprandial" | "correction",
    notes?: string,
    customDate?: Date
  ) => void;
  readonly onCancel: () => void;
  initialDose?: number;
  initialType?: "rapid" | "long" | "mixed";
  initialContext?: "fasting" | "postprandial" | "correction";
  initialNotes?: string;
  initialDate?: Date;
  isEditing?: boolean;
}

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
  const [type, setType] = useState<"rapid" | "long" | "mixed">(initialType);
  const [context, setContext] = useState<
    "fasting" | "postprandial" | "correction"
  >(initialContext);
  const [notes, setNotes] = useState(initialNotes);
  const [showNotes, setShowNotes] = useState(!!initialNotes);
  const [customDate, setCustomDate] = useState<Date>(initialDate || new Date());
  const [useCustomDate, setUseCustomDate] = useState(!!initialDate);
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

    setError("");
    onSubmit(
      numericDose,
      type,
      context,
      notes.trim() || undefined,
      useCustomDate ? customDate : undefined
    );
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isEditing ? "Editar Insulina" : "Registrar Insulina"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dosis */}
          <div>
            <label
              htmlFor="insulin-dose"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dosis (unidades):
            </label>
            <input
              id="insulin-dose"
              type="number"
              value={dose}
              onChange={(e) => {
                setDose(e.target.value);
                clearError();
              }}
              placeholder="10"
              className="w-full px-4 py-3 text-xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0.1"
              max="100"
              step="0.1"
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* Tipo de insulina */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de insulina:
              </legend>
              <div className="space-y-2">
                {[
                  {
                    value: "rapid" as const,
                    label: "Rápida",
                    description: "Actúa en 15-30 minutos",
                  },
                  {
                    value: "long" as const,
                    label: "Lenta",
                    description: "Actúa en 1-2 horas, dura 12-24h",
                  },
                  {
                    value: "mixed" as const,
                    label: "Mixta",
                    description: "Combinación de rápida y lenta",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start space-x-3 cursor-pointer"
                    aria-label={`Tipo de insulina: ${option.label}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={type === option.value}
                      onChange={(e) =>
                        setType(e.target.value as "rapid" | "long" | "mixed")
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
            </fieldset>
          </div>

          {/* Contexto */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">
                Contexto:
              </legend>
              <div className="space-y-2">
                {[
                  {
                    value: "fasting" as const,
                    label: "En ayunas",
                    description: "Antes del desayuno",
                  },
                  {
                    value: "postprandial" as const,
                    label: "Después de comer",
                    description: "Para controlar glucemia postprandial",
                  },
                  {
                    value: "correction" as const,
                    label: "Corrección",
                    description: "Para bajar glucemia alta",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start space-x-3 cursor-pointer"
                    aria-label={`Contexto: ${option.label}`}
                  >
                    <input
                      type="radio"
                      name="context"
                      value={option.value}
                      checked={context === option.value}
                      onChange={(e) =>
                        setContext(
                          e.target.value as
                            | "fasting"
                            | "postprandial"
                            | "correction"
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
            </fieldset>
          </div>

          {/* Fecha personalizada */}
          <div>
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Usar fecha personalizada
              </span>
            </label>

            {useCustomDate && (
              <input
                type="datetime-local"
                value={customDate.toISOString().slice(0, 16)}
                onChange={(e) => setCustomDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Notas opcionales */}
          <div>
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
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
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
              disabled={!dose.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isEditing ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
