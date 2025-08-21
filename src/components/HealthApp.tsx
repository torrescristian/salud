import { useState } from "react";
import { useHealthApp } from "../hooks/health/useHealthApp";
import {
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../types/health";

// Atomic Design Components
import { SetupCard } from "./organisms/SetupCard";
import { AppHeader } from "./organisms/AppHeader";
import { DailySummary } from "./organisms/DailySummary";
import { ActionGrid } from "./organisms/ActionGrid";
import { ProfileForm } from "./organisms/ProfileForm";
import { StackPage } from "./organisms/StackPage";

// Form Components
import { MedicationEntryForm } from "./molecules/MedicationEntryForm";
import { GlucoseMeasurementForm } from "./GlucoseMeasurementForm";
import { PressureMeasurementForm } from "./PressureMeasurementForm";
import { InsulinEntryForm } from "./InsulinEntryForm";

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

  // Stack page states
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showGlucoseForm, setShowGlucoseForm] = useState(false);
  const [showPressureForm, setShowPressureForm] = useState(false);
  const [showInsulinForm, setShowInsulinForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Edit state
  const [editingEntry, setEditingEntry] = useState<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  } | null>(null);

  // Handle edit entry
  const handleEditEntry = (
    type: "medication" | "glucose" | "pressure" | "insulin",
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry
  ) => {
    setEditingEntry({ type, data });

    switch (type) {
      case "medication":
        setShowMedicationForm(true);
        break;
      case "glucose":
        setShowGlucoseForm(true);
        break;
      case "pressure":
        setShowPressureForm(true);
        break;
      case "insulin":
        setShowInsulinForm(true);
        break;
    }
  };

  // Reset editing state
  const resetEditingState = () => {
    setEditingEntry(null);
  };

  // Si no hay perfil, mostrar configuración inicial
  if (!state.userProfile) {
    return (
      <>
        <SetupCard onSetupClick={() => setShowProfileForm(true)} />
        <ProfileForm
          isOpen={showProfileForm}
          onSubmit={(profile) => {
            updateUserProfile(profile);
            setShowProfileForm(false);
          }}
          onCancel={() => setShowProfileForm(false)}
        />
      </>
    );
  }

  const todayEntries = getTodayEntries();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        onProfileClick={() => setShowProfileForm(true)}
        currentDate={state.currentDate}
        userProfile={state.userProfile}
        onDateChange={(date) => {
          // Aquí podrías implementar la lógica para cambiar la fecha
          // Por ahora solo actualizamos el estado
          console.log("Cambiando fecha a:", date);
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <ActionGrid
          onMedicationClick={() => setShowMedicationForm(true)}
          onGlucoseClick={() => setShowGlucoseForm(true)}
          onPressureClick={() => setShowPressureForm(true)}
          onInsulinClick={() => setShowInsulinForm(true)}
        />
        <DailySummary entries={todayEntries} onEditEntry={handleEditEntry} />

        {/* Stack Pages */}
        {showMedicationForm && (
          <StackPage
            title={
              editingEntry && editingEntry.type === "medication"
                ? "Editar Medicación"
                : "Registrar Medicación"
            }
            onBack={() => {
              setShowMedicationForm(false);
              resetEditingState();
            }}
          >
            <MedicationEntryForm
              onSubmit={(
                medicationName: string,
                withFood: "before" | "after" | "during" | "none",
                customDate?: Date
              ) => {
                if (editingEntry && editingEntry.type === "medication") {
                  editMedication(editingEntry.data.id, withFood, customDate);
                  resetEditingState();
                } else {
                  takeMedication(medicationName, withFood);
                }
                setShowMedicationForm(false);
              }}
              onCancel={() => {
                setShowMedicationForm(false);
                resetEditingState();
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
          </StackPage>
        )}

        {showGlucoseForm && (
          <StackPage
            title={
              editingEntry && editingEntry.type === "glucose"
                ? "Editar Glucemia"
                : "Registrar Glucemia"
            }
            onBack={() => {
              setShowGlucoseForm(false);
              resetEditingState();
            }}
          >
            <GlucoseMeasurementForm
              onSubmit={(value, context, customDate) => {
                if (editingEntry && editingEntry.type === "glucose") {
                  editGlucoseMeasurement(
                    editingEntry.data.id,
                    value,
                    context,
                    customDate
                  );
                  resetEditingState();
                } else {
                  addGlucoseMeasurement(value, context, customDate);
                }
                setShowGlucoseForm(false);
              }}
              onCancel={() => {
                setShowGlucoseForm(false);
                resetEditingState();
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
          </StackPage>
        )}

        {showPressureForm && (
          <StackPage
            title={
              editingEntry && editingEntry.type === "pressure"
                ? "Editar Presión Arterial"
                : "Registrar Presión Arterial"
            }
            onBack={() => {
              setShowPressureForm(false);
              resetEditingState();
            }}
          >
            <PressureMeasurementForm
              onSubmit={(systolic, diastolic, customDate) => {
                if (editingEntry && editingEntry.type === "pressure") {
                  editPressureMeasurement(
                    editingEntry.data.id,
                    systolic,
                    diastolic,
                    customDate
                  );
                  resetEditingState();
                } else {
                  addPressureMeasurement(systolic, diastolic, customDate);
                }
                setShowPressureForm(false);
              }}
              onCancel={() => {
                setShowPressureForm(false);
                resetEditingState();
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
          </StackPage>
        )}

        {showInsulinForm && (
          <StackPage
            title={
              editingEntry && editingEntry.type === "insulin"
                ? "Editar Insulina"
                : "Registrar Insulina"
            }
            onBack={() => {
              setShowInsulinForm(false);
              resetEditingState();
            }}
          >
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
                  resetEditingState();
                } else {
                  addInsulinEntry(dose, type, context, notes);
                }
                setShowInsulinForm(false);
              }}
              onCancel={() => {
                setShowInsulinForm(false);
                resetEditingState();
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
          </StackPage>
        )}

        <ProfileForm
          isOpen={showProfileForm}
          onSubmit={(profile) => {
            updateUserProfile(profile);
            setShowProfileForm(false);
          }}
          onCancel={() => setShowProfileForm(false)}
          currentProfile={state.userProfile}
        />
      </main>
    </div>
  );
}
