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

// Existing Form Components (to be refactored later)
import { MedicationInput } from "./MedicationInput";
import { GlucoseMeasurementForm } from "./GlucoseMeasurementForm";
import { PressureMeasurementForm } from "./PressureMeasurementForm";
import { InsulinEntryForm } from "./InsulinEntryForm";

// Atoms
import { Modal } from "./atoms/Modal";

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

  // Modal states
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
  const handleEditEntry = (type: string, data: any) => {
    setEditingEntry({ type: type as any, data });

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
      <AppHeader onProfileClick={() => setShowProfileForm(true)} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <DailySummary entries={todayEntries} onEditEntry={handleEditEntry} />

        <ActionGrid
          onMedicationClick={() => setShowMedicationForm(true)}
          onGlucoseClick={() => setShowGlucoseForm(true)}
          onPressureClick={() => setShowPressureForm(true)}
          onInsulinClick={() => setShowInsulinForm(true)}
        />

        {/* Modals */}
        <Modal
          isOpen={showMedicationForm}
          onClose={() => {
            setShowMedicationForm(false);
            resetEditingState();
          }}
          title={
            editingEntry && editingEntry.type === "medication"
              ? "Editar Medicación"
              : "Registrar Medicación"
          }
          size="lg"
        >
          <MedicationInput
            onMedicationSubmit={(medicationName, withFood, customDate) => {
              if (editingEntry && editingEntry.type === "medication") {
                editMedication(editingEntry.data.id, withFood, customDate);
                resetEditingState();
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
        </Modal>

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
