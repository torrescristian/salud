import { useCallback } from "react";
import {
  AppState,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
  DailyEntry,
} from "../../types/health";
import {
  calculateGlucoseStatus,
  calculatePressureStatus,
  getCurrentTimeString,
} from "../../utils/healthCalculations";
import { generateId } from "@/utils/idGenerator";

export function useMeasurements(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
) {
  // Agregar medición de glucemia
  const addGlucoseMeasurement = useCallback(
    (
      value: number,
      context: "fasting" | "postprandial" | "custom",
      customDate?: Date
    ) => {
      if (!state.userProfile) return;

      const status = calculateGlucoseStatus(
        value,
        state.userProfile.criticalGlucose
      );
      const measurementDate = customDate || new Date();
      const currentTime = getCurrentTimeString();

      const newMeasurement: GlucoseMeasurement = {
        id: generateId(),
        userId: state.userProfile.id,
        timestamp: measurementDate,
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
          date: state.currentDate,
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
              date: state.currentDate,
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
    [state, setState]
  );

  // Agregar medición de presión
  const addPressureMeasurement = useCallback(
    (systolic: number, diastolic: number, customDate?: Date) => {
      if (!state.userProfile) return;

      const status = calculatePressureStatus(
        systolic,
        diastolic,
        state.userProfile.criticalPressure
      );
      const measurementDate = customDate || new Date();
      const currentTime = getCurrentTimeString();

      const newMeasurement: PressureMeasurement = {
        id: generateId(),
        userId: state.userProfile.id,
        timestamp: measurementDate,
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
          date: state.currentDate,
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
              date: state.currentDate,
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
    [state, setState]
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
          date: state.currentDate,
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
              date: state.currentDate,
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
    [state, setState]
  );

  return {
    addGlucoseMeasurement,
    addPressureMeasurement,
    addInsulinEntry,
  };
}
