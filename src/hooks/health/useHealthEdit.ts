import { useCallback } from "react";
import { AppState } from "../../types/health";
import {
  calculateGlucoseStatus,
  calculatePressureStatus,
} from "../../utils/healthCalculations";

export function useHealthEdit(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
) {
  // Editar medición de glucemia
  const editGlucoseMeasurement = useCallback(
    (
      id: string,
      value: number,
      context: "fasting" | "postprandial" | "custom",
      customDate?: Date
    ) => {
      if (!state.userProfile) return;

      const status = calculateGlucoseStatus(
        value,
        state.userProfile.criticalGlucose
      );

      setState((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          glucose: prev.measurements.glucose.map((m) =>
            m.id === id
              ? {
                  ...m,
                  value,
                  context,
                  status,
                  timestamp: customDate || m.timestamp,
                }
              : m
          ),
        },
      }));
    },
    [state, setState]
  );

  // Editar medición de presión
  const editPressureMeasurement = useCallback(
    (id: string, systolic: number, diastolic: number, customDate?: Date) => {
      if (!state.userProfile) return;

      const status = calculatePressureStatus(
        systolic,
        diastolic,
        state.userProfile.criticalPressure
      );

      setState((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          pressure: prev.measurements.pressure.map((m) =>
            m.id === id
              ? {
                  ...m,
                  systolic,
                  diastolic,
                  status,
                  timestamp: customDate || m.timestamp,
                }
              : m
          ),
        },
      }));
    },
    [state, setState]
  );

  // Editar entrada de insulina
  const editInsulinEntry = useCallback(
    (
      id: string,
      dose: number,
      type: "rapid" | "long" | "mixed",
      context: "fasting" | "postprandial" | "correction",
      notes?: string,
      customDate?: Date
    ) => {
      if (!state.userProfile) return;

      setState((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          insulin: prev.measurements.insulin.map((m) =>
            m.id === id
              ? {
                  ...m,
                  dose,
                  type,
                  context,
                  notes,
                  timestamp: customDate || m.timestamp,
                }
              : m
          ),
        },
      }));
    },
    [state, setState]
  );

  // Editar medicación
  const editMedication = useCallback(
    (
      id: string,
      withFood: "before" | "after" | "during" | "none",
      customDate?: Date
    ) => {
      if (!state.userProfile) return;

      setState((prev) => ({
        ...prev,
        userMedications: prev.userMedications.map((m) =>
          m.id === id
            ? { ...m, withFood, lastUsed: customDate || m.lastUsed }
            : m
        ),
      }));
    },
    [state, setState]
  );

  return {
    editGlucoseMeasurement,
    editPressureMeasurement,
    editInsulinEntry,
    editMedication,
  };
}
