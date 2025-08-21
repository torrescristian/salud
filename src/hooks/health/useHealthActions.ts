import { useCallback } from "react";
import { AppState, UserProfile } from "../../types/health";
import {
  getCurrentTimeString,
  generateId,
} from "../../utils/healthCalculations";

export function useHealthActions(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
) {
  // Actualizar perfil de usuario
  const updateUserProfile = useCallback(
    (profile: UserProfile) => {
      setState((prev) => ({ ...prev, userProfile: profile }));
    },
    [setState]
  );

  // Tomar medicación
  const takeMedication = useCallback(
    (
      medicationName: string,
      withFood: "before" | "after" | "during" | "none"
    ) => {
      if (!state.userProfile) return;

      const now = new Date();
      const currentTime = getCurrentTimeString();

      // Buscar o crear medicación
      let medication = state.userMedications.find(
        (m) => m.name === medicationName
      );

      if (medication) {
        // Actualizar medicación existente
        medication.usageCount += 1;
        medication.lastUsed = now;
        medication.withFood = withFood;

        setState((prev) => ({
          ...prev,
          userMedications: prev.userMedications.map((m) =>
            m.name === medicationName ? medication! : m
          ),
        }));
      } else {
        // Crear nueva medicación
        const newMedication = {
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

        medication = newMedication;
      }

      // Agregar a entradas del día
      const todayEntry = state.dailyEntries.find(
        (e) => e.date === state.currentDate
      );

      if (todayEntry) {
        todayEntry.entries.push({
          type: "medication",
          time: currentTime,
          data: medication,
        });

        setState((prev) => ({
          ...prev,
          dailyEntries: prev.dailyEntries.map((e) =>
            e.date === state.currentDate ? todayEntry : e
          ),
        }));
      } else {
        const newDailyEntry = {
          id: generateId(),
          userId: state.userProfile.id,
          date: state.currentDate,
          entries: [
            {
              type: "medication" as const,
              time: currentTime,
              data: medication,
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

  // Obtener sugerencias de medicación
  const getMedicationSuggestions = useCallback(
    (input: string) => {
      return state.userMedications
        .filter((med) => med.name.toLowerCase().includes(input.toLowerCase()))
        .sort((a, b) => {
          // Ordenar por frecuencia de uso y fecha de último uso
          if (a.usageCount !== b.usageCount) {
            return b.usageCount - a.usageCount;
          }
          return (
            new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
          );
        })
        .slice(0, 5); // Limitar a 5 sugerencias
    },
    [state.userMedications]
  );

  // Obtener entradas del día actual
  const getTodayEntries = useCallback(() => {
    return (
      state.dailyEntries.find((e) => e.date === state.currentDate)?.entries ||
      []
    );
  }, [state.dailyEntries, state.currentDate]);

  // Cambiar fecha actual
  const setCurrentDate = useCallback(
    (date: string) => {
      setState((prev) => ({ ...prev, currentDate: date }));
    },
    [setState]
  );

  return {
    updateUserProfile,
    takeMedication,
    getMedicationSuggestions,
    getTodayEntries,
    setCurrentDate,
  };
}
