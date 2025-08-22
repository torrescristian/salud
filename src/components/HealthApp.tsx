import { useState } from "react";
import { createLocalDate } from "../utils/healthCalculations";
import {
  useUserProfile,
  useUpdateUserProfile,
  useAddMedication,
  useUpdateMedication,
  useMedicationSuggestions,
  useAddGlucoseMeasurement,
  useUpdateGlucoseMeasurement,
  useAddPressureMeasurement,
  useUpdatePressureMeasurement,
  useAddInsulinEntry,
  useUpdateInsulinEntry,
  useAllEntries,
  useGlucoseMeasurements,
  usePressureMeasurements,
  useInsulinEntries,
} from "../hooks/useHealthQueries";
import {
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../types/health";

// Atomic Design Components
import { SetupCard } from "./organisms/SetupCard";
import { AppHeader } from "./organisms/AppHeader";
import { ActionGrid } from "./organisms/ActionGrid";
import { ProfileForm } from "./organisms/ProfileForm";
import { StackPage } from "./organisms/StackPage";
import { MobileNavigation, NavigationTab } from "./organisms/MobileNavigation";
import { AdvancedFilters, FilterPeriod } from "./organisms/AdvancedFilters";
import { AnalyticsView } from "./organisms/AnalyticsView";
import { EntriesByDay } from "./organisms/EntriesByDay";

// Form Components
import { MedicationEntryForm } from "./molecules/MedicationEntryForm";
import { GlucoseMeasurementForm } from "./GlucoseMeasurementForm";
import { PressureMeasurementForm } from "./PressureMeasurementForm";
import { InsulinEntryForm } from "./InsulinEntryForm";

export function HealthApp() {
  const { data: userProfile } = useUserProfile();
  const updateUserProfileMutation = useUpdateUserProfile();
  const addMedicationMutation = useAddMedication();
  const updateMedicationMutation = useUpdateMedication();
  const { data: medicationSuggestions } = useMedicationSuggestions("");
  const addGlucoseMutation = useAddGlucoseMeasurement();
  const updateGlucoseMutation = useUpdateGlucoseMeasurement();
  const addPressureMutation = useAddPressureMeasurement();
  const updatePressureMutation = useUpdatePressureMeasurement();
  const addInsulinMutation = useAddInsulinEntry();
  const updateInsulinMutation = useUpdateInsulinEntry();
  const { data: allEntries } = useAllEntries();
  const { data: glucoseMeasurements } = useGlucoseMeasurements();
  const { data: pressureMeasurements } = usePressureMeasurements();
  const { data: insulinEntries } = useInsulinEntries();

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("day");
  const [filterStartDate, setFilterStartDate] = useState<Date>(
    createLocalDate()
  );
  const [filterEndDate, setFilterEndDate] = useState<Date>(createLocalDate());

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

  // Handle filter period change
  const handleFilterPeriodChange = (
    period: FilterPeriod,
    startDate: Date,
    endDate: Date
  ) => {
    setFilterPeriod(period);
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
  };

  // Si no hay perfil, mostrar configuración inicial
  if (!userProfile) {
    return (
      <>
        <SetupCard onSetupClick={() => setShowProfileForm(true)} />
        {showProfileForm && (
          <ProfileForm
            onSubmit={(profile) => {
              updateUserProfileMutation.mutate(profile);
              setShowProfileForm(false);
            }}
            onCancel={() => setShowProfileForm(false)}
          />
        )}
      </>
    );
  }

  // No necesitamos esta línea ya que usamos el hook useTodayEntries

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppHeader
        onProfileClick={() => setShowProfileForm(true)}
        userProfile={userProfile}
      />

      <main className="max-w-4xl mx-auto px-4 py-4">
        {activeTab === "home" && (
          <>
            <ActionGrid
              onMedicationClick={() => setShowMedicationForm(true)}
              onGlucoseClick={() => setShowGlucoseForm(true)}
              onPressureClick={() => setShowPressureForm(true)}
              onInsulinClick={() => setShowInsulinForm(true)}
            />
            <EntriesByDay
              entries={allEntries || []}
              onEditEntry={handleEditEntry}
            />
          </>
        )}

        {activeTab === "filters" && (
          <AdvancedFilters
            onPeriodChange={handleFilterPeriodChange}
            entries={allEntries || []}
            onEditEntry={handleEditEntry}
          />
        )}

        {/* Debug info - remove later */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-400 mt-4">
            Filter: {filterPeriod} | Start: {filterStartDate.toDateString()} |
            End: {filterEndDate.toDateString()}
          </div>
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            glucoseMeasurements={glucoseMeasurements || []}
            pressureMeasurements={pressureMeasurements || []}
            insulinEntries={insulinEntries || []}
          />
        )}

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
                  updateMedicationMutation.mutate({
                    id: editingEntry.data.id,
                    updates: {
                      withFood,
                      lastUsed: customDate || createLocalDate(),
                    },
                  });
                  resetEditingState();
                } else {
                  addMedicationMutation.mutate({
                    name: medicationName,
                    withFood,
                    customDate,
                  });
                }
                setShowMedicationForm(false);
              }}
              onCancel={() => {
                setShowMedicationForm(false);
                resetEditingState();
              }}
              suggestions={medicationSuggestions || []}
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
                  updateGlucoseMutation.mutate({
                    id: editingEntry.data.id,
                    updates: {
                      value,
                      context,
                      timestamp: customDate || createLocalDate(),
                    },
                  });
                  resetEditingState();
                } else {
                  addGlucoseMutation.mutate({
                    value,
                    context,
                    customDate,
                  });
                }
                setShowGlucoseForm(false);
              }}
              onCancel={() => {
                setShowGlucoseForm(false);
                resetEditingState();
              }}
              criticalLimits={
                userProfile?.criticalGlucose || { min: 70, max: 180 }
              }
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
                  updatePressureMutation.mutate({
                    id: editingEntry.data.id,
                    updates: {
                      systolic,
                      diastolic,
                      timestamp: customDate || createLocalDate(),
                    },
                  });
                  resetEditingState();
                } else {
                  addPressureMutation.mutate({
                    systolic,
                    diastolic,
                    customDate,
                  });
                }
                setShowPressureForm(false);
              }}
              onCancel={() => {
                setShowPressureForm(false);
                resetEditingState();
              }}
              criticalLimits={
                userProfile?.criticalPressure || {
                  systolic: { min: 90, max: 140 },
                  diastolic: { min: 60, max: 90 },
                }
              }
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
                  updateInsulinMutation.mutate({
                    id: editingEntry.data.id,
                    updates: {
                      dose,
                      type,
                      context,
                      notes,
                      timestamp: customDate || createLocalDate(),
                    },
                  });
                  resetEditingState();
                } else {
                  addInsulinMutation.mutate({
                    dose,
                    type,
                    context,
                    notes,
                    customDate,
                  });
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

        {showProfileForm && (
          <ProfileForm
            onSubmit={(profile) => {
              updateUserProfileMutation.mutate(profile);
              setShowProfileForm(false);
            }}
            onCancel={() => setShowProfileForm(false)}
            currentProfile={userProfile}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
