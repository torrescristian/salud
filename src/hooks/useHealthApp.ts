import { useState, useEffect, useCallback } from "react";
import {
  AppState,
  UserProfile,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
  DailyEntry,
} from "../types/health";
import { LocalStorage } from "../utils/localStorage";
import {
  generateId,
  getCurrentDateString,
  getCurrentTimeString,
  calculateGlucoseStatus,
  calculatePressureStatus,
} from "../utils/healthCalculations";

// Estado inicial de la aplicación
const initialState: AppState = {
  userProfile: null,
  dailyEntries: [],
  userMedications: [],
  currentDate: getCurrentDateString(),
  measurements: {
    glucose: [],
    pressure: [],
    insulin: [],
  },
};

export function useHealthApp() {
  const [state, setState] = useState<AppState>(initialState);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const loadInitialData = () => {
      const userProfile = LocalStorage.loadUserProfile();
      const dailyEntries = LocalStorage.loadDailyEntries();
      const userMedications = LocalStorage.loadUserMedications();
      const glucoseMeasurements = LocalStorage.loadGlucoseMeasurements();
      const pressureMeasurements = LocalStorage.loadPressureMeasurements();
      const insulinEntries = LocalStorage.loadInsulinEntries();

      setState((prev) => ({
        ...prev,
        userProfile,
        dailyEntries: dailyEntries || [],
        userMedications: userMedications || [],
        measurements: {
          glucose: glucoseMeasurements || [],
          pressure: pressureMeasurements || [],
          insulin: insulinEntries || [],
        },
      }));
    };

    loadInitialData();
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    if (state.userProfile) {
      LocalStorage.saveUserProfile(state.userProfile);
    }
    LocalStorage.saveDailyEntries(state.dailyEntries);
    LocalStorage.saveUserMedications(state.userMedications);
    LocalStorage.saveGlucoseMeasurements(state.measurements.glucose);
    LocalStorage.savePressureMeasurements(state.measurements.pressure);
    LocalStorage.saveInsulinEntries(state.measurements.insulin);
  }, [state]);

  // Actualizar perfil de usuario
  const updateUserProfile = useCallback((profile: UserProfile) => {
    setState((prev) => ({ ...prev, userProfile: profile }));
  }, []);

  // Tomar medicación
  const takeMedication = useCallback(
    (
      medicationName: string,
      withFood: "before" | "after" | "during" | "none"
    ) => {
      const now = new Date();
      const currentTime = getCurrentTimeString();

      // Buscar si ya existe el medicamento
      let medication = state.userMedications.find(
        (m) => m.name.toLowerCase() === medicationName.toLowerCase()
      );

      if (medication) {
        // Actualizar medicamento existente
        medication = {
          ...medication,
          usageCount: medication.usageCount + 1,
          lastUsed: now,
        };

        setState((prev) => ({
          ...prev,
          userMedications: prev.userMedications.map((m) =>
            m.id === medication?.id ? medication : m
          ),
        }));
      } else {
        // Crear nuevo medicamento
        const newMedication: UserMedication = {
          id: generateId(),
          name: medicationName,
          withFood,
          usageCount: 1,
          lastUsed: now,
        };

        setState((prev) => ({
          ...prev,
          userMedications: [...prev.userMedications, newMedication],
        }));
      }

      // Agregar a entradas del día
      const todayEntry = state.dailyEntries.find(
        (e) => e.date === state.currentDate
      );

      if (todayEntry) {
        todayEntry.entries.push({
          type: "medication",
          time: currentTime,
          data: medication || {
            id: generateId(),
            name: medicationName,
            withFood,
            usageCount: 1,
            lastUsed: now,
          },
        });

        setState((prev) => ({
          ...prev,
          dailyEntries: prev.dailyEntries.map((e) =>
            e.date === state.currentDate ? todayEntry : e
          ),
        }));
      } else {
        // Crear nueva entrada del día
        const newDailyEntry: DailyEntry = {
          id: generateId(),
          userId: state.userProfile?.id || "default",
          date: state.currentDate,
          entries: [
            {
              type: "medication",
              time: currentTime,
              data: medication || {
                id: generateId(),
                name: medicationName,
                withFood,
                usageCount: 1,
                lastUsed: now,
              },
            },
          ],
        };

        setState((prev) => ({
          ...prev,
          dailyEntries: [...prev.dailyEntries, newDailyEntry],
        }));
      }
    },
    [state]
  );

  // Obtener sugerencias de medicamentos
  const getMedicationSuggestions = useCallback(
    (input: string): UserMedication[] => {
      if (!input.trim()) return [];

      return state.userMedications
        .filter((m) => m.name.toLowerCase().includes(input.toLowerCase()))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);
    },
    [state.userMedications]
  );

  // Agregar medición de glucemia
  const addGlucoseMeasurement = useCallback(
    (value: number, context: "fasting" | "postprandial" | "custom") => {
      if (!state.userProfile) return;

      const status = calculateGlucoseStatus(
        value,
        state.userProfile.criticalGlucose
      );
      const now = new Date();
      const currentTime = getCurrentTimeString();

      const newMeasurement: GlucoseMeasurement = {
        id: generateId(),
        userId: state.userProfile.id,
        timestamp: now,
        value,
        context,
        status,
      };

      setState((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          glucose: [...prev.measurements.glucose, newMeasurement],
        },
      }));

      // Agregar a entradas del día
      const todayEntry = state.dailyEntries.find(
        (e) => e.date === state.currentDate
      );

      if (todayEntry) {
        todayEntry.entries.push({
          type: "glucose",
          time: currentTime,
          data: newMeasurement,
        });

        setState((prev) => ({
          ...prev,
          dailyEntries: prev.dailyEntries.map((e) =>
            e.date === state.currentDate ? todayEntry : e
          ),
        }));
      } else {
        const newDailyEntry: DailyEntry = {
          id: generateId(),
          userId: state.userProfile.id,
          date: state.currentDate,
          entries: [
            {
              type: "glucose",
              time: currentTime,
              data: newMeasurement,
            },
          ],
        };

        setState((prev) => ({
          ...prev,
          dailyEntries: [...prev.dailyEntries, newDailyEntry],
        }));
      }
    },
    [state]
  );

  // Agregar medición de presión
  const addPressureMeasurement = useCallback(
    (systolic: number, diastolic: number) => {
      if (!state.userProfile) return;

      const status = calculatePressureStatus(
        systolic,
        diastolic,
        state.userProfile.criticalPressure
      );
      const now = new Date();
      const currentTime = getCurrentTimeString();

      const newMeasurement: PressureMeasurement = {
        id: generateId(),
        userId: state.userProfile.id,
        timestamp: now,
        systolic,
        diastolic,
        status,
      };

      setState((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          pressure: [...prev.measurements.pressure, newMeasurement],
        },
      }));

      // Agregar a entradas del día
      const todayEntry = state.dailyEntries.find(
        (e) => e.date === state.currentDate
      );

      if (todayEntry) {
        todayEntry.entries.push({
          type: "pressure",
          time: currentTime,
          data: newMeasurement,
        });

        setState((prev) => ({
          ...prev,
          dailyEntries: prev.dailyEntries.map((e) =>
            e.date === state.currentDate ? todayEntry : e
          ),
        }));
      } else {
        const newDailyEntry: DailyEntry = {
          id: generateId(),
          userId: state.userProfile.id,
          date: state.currentDate,
          entries: [
            {
              type: "pressure",
              time: currentTime,
              data: newMeasurement,
            },
          ],
        };

        setState((prev) => ({
          ...prev,
          dailyEntries: [...prev.dailyEntries, newDailyEntry],
        }));
      }
    },
    [state]
  );

  // Agregar entrada de insulina
  const addInsulinEntry = useCallback(
    (
      dose: number,
      type: "rapid" | "long" | "mixed",
      context: "fasting" | "postprandial" | "correction",
      notes?: string
    ) => {
      if (!state.userProfile) return;

      const now = new Date();
      const currentTime = getCurrentTimeString();

      const newEntry: InsulinEntry = {
        id: generateId(),
        userId: state.userProfile.id,
        timestamp: now,
        dose,
        type,
        context,
        notes,
      };

      setState((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          insulin: [...prev.measurements.insulin, newEntry],
        },
      }));

      // Agregar a entradas del día
      const todayEntry = state.dailyEntries.find(
        (e) => e.date === state.currentDate
      );

      if (todayEntry) {
        todayEntry.entries.push({
          type: "insulin",
          time: currentTime,
          data: newEntry,
        });

        setState((prev) => ({
          ...prev,
          dailyEntries: prev.dailyEntries.map((e) =>
            e.date === state.currentDate ? todayEntry : e
          ),
        }));
      } else {
        const newDailyEntry: DailyEntry = {
          id: generateId(),
          userId: state.userProfile.id,
          date: state.currentDate,
          entries: [
            {
              type: "insulin",
              time: currentTime,
              data: newEntry,
            },
          ],
        };

        setState((prev) => ({
          ...prev,
          dailyEntries: [...prev.dailyEntries, newDailyEntry],
        }));
      }
    },
    [state]
  );

  // Obtener entradas del día actual
  const getTodayEntries = useCallback(() => {
    return (
      state.dailyEntries.find((e) => e.date === state.currentDate)?.entries ||
      []
    );
  }, [state.dailyEntries, state.currentDate]);

  // Cambiar fecha actual
  const setCurrentDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, currentDate: date }));
  }, []);

  return {
    state,
    updateUserProfile,
    takeMedication,
    getMedicationSuggestions,
    addGlucoseMeasurement,
    addPressureMeasurement,
    addInsulinEntry,
    getTodayEntries,
    setCurrentDate,
  };
}
