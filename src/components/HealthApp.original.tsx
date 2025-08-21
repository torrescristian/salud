import { useState } from "react";
import { useHealthApp } from "../hooks/health/useHealthApp";
import {
  UserProfile,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../types/health";
import { MedicationInput } from "./MedicationInput";
import { GlucoseMeasurementForm } from "./GlucoseMeasurementForm";
import { PressureMeasurementForm } from "./PressureMeasurementForm";
import { InsulinEntryForm } from "./InsulinEntryForm";
import { formatDate } from "../utils/healthCalculations";

export function HealthApp() {
  const {
    state,
    updateUserProfile,
    takeMedication,
    getMedicationSuggestions,
    addGlucoseMeasurement,
    addPressureMeasurement,
    addInsulinEntry,
    editGlucoseMeasurement,
    editPressureMeasurement,
    editInsulinEntry,
    editMedication,
    getTodayEntries,
  } = useHealthApp();

  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showGlucoseForm, setShowGlucoseForm] = useState(false);
  const [showPressureForm, setShowPressureForm] = useState(false);
  const [showInsulinForm, setShowInsulinForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Estados para edición
  const [editingEntry, setEditingEntry] = useState<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  } | null>(null);

  // Si no hay perfil, mostrar formulario de perfil
  if (!state.userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Configuración Inicial
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Para comenzar, necesitamos configurar algunos datos básicos de tu
            perfil de salud.
          </p>
          <button
            onClick={() => setShowProfileForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Configurar Perfil
          </button>
        </div>

        {showProfileForm && (
          <ProfileForm
            onSubmit={(profile) => {
              updateUserProfile(profile);
              setShowProfileForm(false);
            }}
            onCancel={() => setShowProfileForm(false)}
          />
        )}
      </div>
    );
  }

  const todayEntries = getTodayEntries();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Control Médico</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {formatDate(new Date())}
              </span>
              <button
                onClick={() => setShowProfileForm(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Perfil
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Vista del día */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            HOY - Resumen
          </h2>

          {todayEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay registros para hoy. ¡Comienza agregando tu primera
              medicación o medición!
            </p>
          ) : (
            <div className="space-y-4">
              {todayEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-500 text-sm">{entry.time}</span>
                  <div className="flex-1">
                    {entry.type === "medication" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✅</span>
                        <span className="font-medium">
                          {(entry.data as UserMedication).name}
                        </span>
                        <span className="text-sm text-gray-600">
                          (
                          {getFoodRelationText(
                            (entry.data as UserMedication).withFood
                          )}
                          )
                        </span>
                        <button
                          onClick={() => {
                            setEditingEntry({
                              type: "medication",
                              data: entry.data,
                            });
                            setShowMedicationForm(true);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    )}
                    {entry.type === "glucose" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">📊</span>
                        <span className="font-medium">
                          Glucemia: {(entry.data as GlucoseMeasurement).value}{" "}
                          mg/dL
                        </span>
                        <span
                          className={`text-sm ${getStatusColor(
                            (entry.data as GlucoseMeasurement).status
                          )}`}
                        >
                          {getStatusEmoji(
                            (entry.data as GlucoseMeasurement).status
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setEditingEntry({
                              type: "glucose",
                              data: entry.data,
                            });
                            setShowGlucoseForm(true);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    )}
                    {entry.type === "pressure" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600">❤️</span>
                        <span className="font-medium">
                          Presión:{" "}
                          {(entry.data as PressureMeasurement).systolic}/
                          {(entry.data as PressureMeasurement).diastolic} mmHg
                        </span>
                        <span
                          className={`text-sm ${getStatusColor(
                            (entry.data as PressureMeasurement).status
                          )}`}
                        >
                          {getStatusEmoji(
                            (entry.data as PressureMeasurement).status
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setEditingEntry({
                              type: "pressure",
                              data: entry.data,
                            });
                            setShowPressureForm(true);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    )}
                    {entry.type === "insulin" && (
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600">💉</span>
                        <span className="font-medium">
                          Insulina: {(entry.data as InsulinEntry).dose} unidades
                          ({(entry.data as InsulinEntry).type})
                        </span>
                        <button
                          onClick={() => {
                            setEditingEntry({
                              type: "insulin",
                              data: entry.data,
                            });
                            setShowInsulinForm(true);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setShowMedicationForm(true)}
            className="bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Medicación
          </button>
          <button
            onClick={() => setShowGlucoseForm(true)}
            className="bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-green-700 transition-colors"
          >
            Glucemia
          </button>
          <button
            onClick={() => setShowPressureForm(true)}
            className="bg-red-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-red-700 transition-colors"
          >
            Presión
          </button>
          <button
            onClick={() => setShowInsulinForm(true)}
            className="bg-purple-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-purple-700 transition-colors"
          >
            Insulina
          </button>
        </div>

        {/* Formularios modales */}
        {showMedicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingEntry && editingEntry.type === "medication"
                    ? "Editar Medicación"
                    : "Registrar Medicación"}
                </h2>
                <button
                  onClick={() => setShowMedicationForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <MedicationInput
                onMedicationSubmit={(medicationName, withFood, customDate) => {
                  if (editingEntry && editingEntry.type === "medication") {
                    editMedication(editingEntry.data.id, withFood, customDate);
                    setEditingEntry(null);
                  } else {
                    takeMedication(medicationName, withFood);
                  }
                  setShowMedicationForm(false);
                }}
                suggestions={getMedicationSuggestions("")}
                placeholder="Nombre del medicamento..."
                initialMedicationName={
                  editingEntry?.type === "medication"
                    ? (editingEntry.data as UserMedication).name
                    : undefined
                }
                initialWithFood={
                  editingEntry?.type === "medication"
                    ? (editingEntry.data as UserMedication).withFood
                    : undefined
                }
                initialDate={
                  editingEntry?.type === "medication"
                    ? (editingEntry.data as UserMedication).lastUsed
                    : undefined
                }
                isEditing={!!editingEntry && editingEntry.type === "medication"}
              />
            </div>
          </div>
        )}

        {showGlucoseForm && (
          <GlucoseMeasurementForm
            onSubmit={(value, context, customDate) => {
              if (editingEntry && editingEntry.type === "glucose") {
                editGlucoseMeasurement(
                  editingEntry.data.id,
                  value,
                  context,
                  customDate
                );
                setEditingEntry(null);
              } else {
                addGlucoseMeasurement(value, context, customDate);
              }
              setShowGlucoseForm(false);
            }}
            onCancel={() => {
              setShowGlucoseForm(false);
              setEditingEntry(null);
            }}
            criticalLimits={state.userProfile.criticalGlucose}
            initialValue={
              editingEntry?.type === "glucose"
                ? (editingEntry.data as GlucoseMeasurement).value
                : undefined
            }
            initialContext={
              editingEntry?.type === "glucose"
                ? (editingEntry.data as GlucoseMeasurement).context
                : undefined
            }
            initialDate={
              editingEntry?.type === "glucose"
                ? (editingEntry.data as GlucoseMeasurement).timestamp
                : undefined
            }
            isEditing={!!editingEntry && editingEntry.type === "glucose"}
          />
        )}

        {showPressureForm && (
          <PressureMeasurementForm
            onSubmit={(systolic, diastolic, customDate) => {
              if (editingEntry && editingEntry.type === "pressure") {
                editPressureMeasurement(
                  editingEntry.data.id,
                  systolic,
                  diastolic,
                  customDate
                );
                setEditingEntry(null);
              } else {
                addPressureMeasurement(systolic, diastolic, customDate);
              }
              setShowPressureForm(false);
            }}
            onCancel={() => {
              setShowPressureForm(false);
              setEditingEntry(null);
            }}
            criticalLimits={state.userProfile.criticalPressure}
            initialSystolic={
              editingEntry?.type === "pressure"
                ? (editingEntry.data as PressureMeasurement).systolic
                : undefined
            }
            initialDiastolic={
              editingEntry?.type === "pressure"
                ? (editingEntry.data as PressureMeasurement).diastolic
                : undefined
            }
            initialDate={
              editingEntry?.type === "pressure"
                ? (editingEntry.data as PressureMeasurement).timestamp
                : undefined
            }
            isEditing={!!editingEntry && editingEntry.type === "pressure"}
          />
        )}

        {showInsulinForm && (
          <InsulinEntryForm
            onSubmit={(dose, type, context, notes, customDate) => {
              if (editingEntry && editingEntry.type === "insulin") {
                editInsulinEntry(
                  editingEntry.data.id,
                  dose,
                  type,
                  context,
                  notes,
                  customDate
                );
                setEditingEntry(null);
              } else {
                addInsulinEntry(dose, type, context, notes);
              }
              setShowInsulinForm(false);
            }}
            onCancel={() => {
              setShowInsulinForm(false);
              setEditingEntry(null);
            }}
            initialDose={
              editingEntry?.type === "insulin"
                ? (editingEntry.data as InsulinEntry).dose
                : undefined
            }
            initialType={
              editingEntry?.type === "insulin"
                ? (editingEntry.data as InsulinEntry).type
                : undefined
            }
            initialContext={
              editingEntry?.type === "insulin"
                ? (editingEntry.data as InsulinEntry).context
                : undefined
            }
            initialNotes={
              editingEntry?.type === "insulin"
                ? (editingEntry.data as InsulinEntry).notes
                : undefined
            }
            initialDate={
              editingEntry?.type === "insulin"
                ? (editingEntry.data as InsulinEntry).timestamp
                : undefined
            }
            isEditing={!!editingEntry && editingEntry.type === "insulin"}
          />
        )}

        {showProfileForm && (
          <ProfileForm
            onSubmit={(profile) => {
              updateUserProfile(profile);
              setShowProfileForm(false);
            }}
            onCancel={() => setShowProfileForm(false)}
            currentProfile={state.userProfile}
          />
        )}
      </main>
    </div>
  );
}

// Componente de perfil de usuario
function ProfileForm({
  onSubmit,
  onCancel,
  currentProfile,
}: {
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
  currentProfile?: UserProfile;
}) {
  const [name, setName] = useState(currentProfile?.name || "");
  const [glucoseMin, setGlucoseMin] = useState(
    currentProfile?.criticalGlucose?.min?.toString() || "70"
  );
  const [glucoseMax, setGlucoseMax] = useState(
    currentProfile?.criticalGlucose?.max?.toString() || "100"
  );
  const [systolicMin, setSystolicMin] = useState(
    currentProfile?.criticalPressure?.systolic?.min?.toString() || "110"
  );
  const [systolicMax, setSystolicMax] = useState(
    currentProfile?.criticalPressure?.systolic?.max?.toString() || "120"
  );
  const [diastolicMin, setDiastolicMin] = useState(
    currentProfile?.criticalPressure?.diastolic?.min?.toString() || "70"
  );
  const [diastolicMax, setDiastolicMax] = useState(
    currentProfile?.criticalPressure?.diastolic?.max?.toString() || "80"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: currentProfile?.id || "default",
      name,
      criticalGlucose: {
        min: parseFloat(glucoseMin),
        max: parseFloat(glucoseMax),
      },
      criticalPressure: {
        systolic: {
          min: parseFloat(systolicMin),
          max: parseFloat(systolicMax),
        },
        diastolic: {
          min: parseFloat(diastolicMin),
          max: parseFloat(diastolicMax),
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {currentProfile ? "Editar Perfil" : "Configurar Perfil"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre:
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límites de Glucemia (mg/dL):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={glucoseMin}
                onChange={(e) => setGlucoseMin(e.target.value)}
                placeholder="70"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                value={glucoseMax}
                onChange={(e) => setGlucoseMax(e.target.value)}
                placeholder="100"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límites de Presión Sistólica (mmHg):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={systolicMin}
                onChange={(e) => setSystolicMin(e.target.value)}
                placeholder="110"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                value={systolicMax}
                onChange={(e) => setSystolicMax(e.target.value)}
                placeholder="120"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límites de Presión Diastólica (mmHg):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={diastolicMin}
                onChange={(e) => setDiastolicMin(e.target.value)}
                placeholder="70"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                value={diastolicMax}
                onChange={(e) => setDiastolicMax(e.target.value)}
                placeholder="80"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Funciones auxiliares
function getFoodRelationText(withFood: string): string {
  switch (withFood) {
    case "before":
      return "antes de comer";
    case "during":
      return "durante la comida";
    case "after":
      return "después de comer";
    case "none":
      return "sin relación con comida";
    default:
      return "";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "normal":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "critical":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case "normal":
      return "🟢";
    case "warning":
      return "🟡";
    case "critical":
      return "🔴";
    default:
      return "⚪";
  }
}
