import { useState, useRef, useEffect } from "react";
import { UserMedication } from "../types/health";

interface MedicationInputProps {
  onMedicationSubmit: (
    medicationName: string,
    withFood: "before" | "after" | "during" | "none"
  ) => void;
  suggestions: UserMedication[];
  placeholder?: string;
}

export function MedicationInput({
  onMedicationSubmit,
  suggestions,
  placeholder = "Nombre del medicamento...",
}: MedicationInputProps) {
  const [medicationName, setMedicationName] = useState("");
  const [withFood, setWithFood] = useState<
    "before" | "after" | "during" | "none"
  >("none");
  const [notes, setNotes] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicationName.trim()) {
      onMedicationSubmit(medicationName.trim(), withFood);
      setMedicationName("");
      setWithFood("none");
      setNotes("");
      setShowNotes(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (medication: UserMedication) => {
    setMedicationName(medication.name);
    setWithFood(medication.withFood);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de medicamento */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={medicationName}
            onChange={(e) => {
              setMedicationName(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(medicationName.length > 0)}
            placeholder={placeholder}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((medication) => (
                <button
                  key={medication.id}
                  type="button"
                  onClick={() => handleSuggestionClick(medication)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                >
                  <div className="font-medium">{medication.name}</div>
                  <div className="text-sm text-gray-600">
                    Usado {medication.usageCount} veces • Último:{" "}
                    {medication.lastUsed.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Relación con comida */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relación con comida:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "before" as const, label: "🍽️⬅️ Antes", icon: "🍽️⬅️" },
              { value: "during" as const, label: "🍽️⏺️ Durante", icon: "🍽️⏺️" },
              { value: "after" as const, label: "🍽️➡️ Después", icon: "🍽️➡️" },
              { value: "none" as const, label: "🚫 Ninguna", icon: "🚫" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setWithFood(option.value)}
                className={`p-3 text-center rounded-lg border-2 transition-colors ${
                  withFood === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
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

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!medicationName.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Registrar Medicación
        </button>
      </form>
    </div>
  );
}
