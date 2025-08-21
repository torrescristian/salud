import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useHealthApp } from "../../hooks/useHealthApp";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useHealthApp", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });

  describe("Estado inicial", () => {
    it("debe tener estado inicial correcto", () => {
      const { result } = renderHook(() => useHealthApp());

      expect(result.current.state.userProfile).toBeNull();
      expect(result.current.state.dailyEntries).toEqual([]);
      expect(result.current.state.userMedications).toEqual([]);
      expect(result.current.state.measurements.glucose).toEqual([]);
      expect(result.current.state.measurements.pressure).toEqual([]);
      expect(result.current.state.measurements.insulin).toEqual([]);
    });
  });

  describe("updateUserProfile", () => {
    it("debe actualizar el perfil del usuario", () => {
      const { result } = renderHook(() => useHealthApp());

      const newProfile = {
        id: "test",
        name: "Juan Pérez",
        criticalGlucose: { min: 80, max: 120 },
        criticalPressure: {
          systolic: { min: 100, max: 140 },
          diastolic: { min: 60, max: 90 },
        },
      };

      act(() => {
        result.current.updateUserProfile(newProfile);
      });

      expect(result.current.state.userProfile).toEqual(newProfile);
    });
  });

  describe("takeMedication", () => {
    it("debe agregar nueva medicación cuando no existe", () => {
      const { result } = renderHook(() => useHealthApp());

      act(() => {
        result.current.takeMedication("Metformina", "during");
      });

      expect(result.current.state.userMedications).toHaveLength(1);
      expect(result.current.state.userMedications[0].name).toBe("Metformina");
      expect(result.current.state.userMedications[0].withFood).toBe("during");
      expect(result.current.state.userMedications[0].usageCount).toBe(1);
    });

    it("debe actualizar medicación existente", () => {
      const { result } = renderHook(() => useHealthApp());

      // Agregar primera medicación
      act(() => {
        result.current.takeMedication("Metformina", "during");
      });

      // Agregar segunda vez
      act(() => {
        result.current.takeMedication("Metformina", "during");
      });

      expect(result.current.state.userMedications).toHaveLength(1);
      expect(result.current.state.userMedications[0].usageCount).toBe(2);
    });

    it("debe agregar entrada diaria", () => {
      const { result } = renderHook(() => useHealthApp());

      act(() => {
        result.current.takeMedication("Metformina", "during");
      });

      expect(result.current.state.dailyEntries).toHaveLength(1);
      expect(result.current.state.dailyEntries[0].entries).toHaveLength(1);
      expect(result.current.state.dailyEntries[0].entries[0].type).toBe(
        "medication"
      );
    });
  });

  describe("getMedicationSuggestions", () => {
    it("debe retornar sugerencias basadas en input", () => {
      const { result } = renderHook(() => useHealthApp());

      // Agregar medicaciones
      act(() => {
        result.current.takeMedication("Metformina", "during");
        result.current.takeMedication("Insulina", "before");
        result.current.takeMedication("Aspirina", "none");
      });

      const suggestions = result.current.getMedicationSuggestions("met");

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].name).toBe("Metformina");
    });

    it("debe retornar array vacío para input vacío", () => {
      const { result } = renderHook(() => useHealthApp());

      const suggestions = result.current.getMedicationSuggestions("");

      expect(suggestions).toEqual([]);
    });

    it("debe ordenar por frecuencia de uso", () => {
      const { result } = renderHook(() => useHealthApp());

      // Agregar medicaciones con diferentes frecuencias
      act(() => {
        result.current.takeMedication("Metformina", "during"); // 1 vez
        result.current.takeMedication("Insulina", "before"); // 1 vez
        result.current.takeMedication("Metformina", "during"); // 2 veces
      });

      const allSuggestions = result.current.getMedicationSuggestions("a");
      expect(allSuggestions.length).toBeGreaterThanOrEqual(2);

      // Verificar que Metformina esté primero (más usado)
      const metforminaIndex = allSuggestions.findIndex(
        (m) => m.name === "Metformina"
      );
      const insulinaIndex = allSuggestions.findIndex(
        (m) => m.name === "Insulina"
      );

      expect(metforminaIndex).toBeGreaterThanOrEqual(0);
      expect(insulinaIndex).toBeGreaterThanOrEqual(0);
      expect(metforminaIndex).toBeLessThan(insulinaIndex); // Metformina debe estar antes
    });
  });

  describe("addGlucoseMeasurement", () => {
    it("debe agregar medición de glucemia", () => {
      const { result } = renderHook(() => useHealthApp());

      // Configurar perfil primero
      act(() => {
        result.current.updateUserProfile({
          id: "test",
          name: "Juan Pérez",
          criticalGlucose: { min: 80, max: 120 },
          criticalPressure: {
            systolic: { min: 100, max: 140 },
            diastolic: { min: 60, max: 90 },
          },
        });
      });

      act(() => {
        result.current.addGlucoseMeasurement(95, "fasting");
      });

      expect(result.current.state.measurements.glucose).toHaveLength(1);
      expect(result.current.state.measurements.glucose[0].value).toBe(95);
      expect(result.current.state.measurements.glucose[0].context).toBe(
        "fasting"
      );
      expect(result.current.state.measurements.glucose[0].status).toBe(
        "normal"
      );
    });

    it("debe calcular estado correcto según límites", () => {
      const { result } = renderHook(() => useHealthApp());

      act(() => {
        result.current.updateUserProfile({
          id: "test",
          name: "Juan Pérez",
          criticalGlucose: { min: 80, max: 120 },
          criticalPressure: {
            systolic: { min: 100, max: 140 },
            diastolic: { min: 60, max: 90 },
          },
        });
      });

      act(() => {
        result.current.addGlucoseMeasurement(150, "fasting");
      });

      expect(result.current.state.measurements.glucose[0].status).toBe(
        "critical"
      );
    });
  });

  describe("addPressureMeasurement", () => {
    it("debe agregar medición de presión", () => {
      const { result } = renderHook(() => useHealthApp());

      act(() => {
        result.current.updateUserProfile({
          id: "test",
          name: "Juan Pérez",
          criticalGlucose: { min: 80, max: 120 },
          criticalPressure: {
            systolic: { min: 100, max: 140 },
            diastolic: { min: 60, max: 90 },
          },
        });
      });

      act(() => {
        result.current.addPressureMeasurement(125, 85);
      });

      expect(result.current.state.measurements.pressure).toHaveLength(1);
      expect(result.current.state.measurements.pressure[0].systolic).toBe(125);
      expect(result.current.state.measurements.pressure[0].diastolic).toBe(85);
    });
  });

  describe("addInsulinEntry", () => {
    it("debe agregar entrada de insulina", () => {
      const { result } = renderHook(() => useHealthApp());

      act(() => {
        result.current.updateUserProfile({
          id: "test",
          name: "Juan Pérez",
          criticalGlucose: { min: 80, max: 120 },
          criticalPressure: {
            systolic: { min: 100, max: 140 },
            diastolic: { min: 60, max: 90 },
          },
        });
      });

      act(() => {
        result.current.addInsulinEntry(
          15,
          "rapid",
          "fasting",
          "Nota de prueba"
        );
      });

      expect(result.current.state.measurements.insulin).toHaveLength(1);
      expect(result.current.state.measurements.insulin[0].dose).toBe(15);
      expect(result.current.state.measurements.insulin[0].type).toBe("rapid");
      expect(result.current.state.measurements.insulin[0].context).toBe(
        "fasting"
      );
      expect(result.current.state.measurements.insulin[0].notes).toBe(
        "Nota de prueba"
      );
    });
  });

  describe("getTodayEntries", () => {
    it("debe retornar entradas del día actual", () => {
      const { result } = renderHook(() => useHealthApp());

      // Agregar medicación
      act(() => {
        result.current.takeMedication("Metformina", "during");
      });

      const todayEntries = result.current.getTodayEntries();

      expect(todayEntries).toHaveLength(1);
      expect(todayEntries[0].type).toBe("medication");
    });
  });

  describe("setCurrentDate", () => {
    it("debe cambiar la fecha actual", () => {
      const { result } = renderHook(() => useHealthApp());

      const newDate = "2024-01-15";

      act(() => {
        result.current.setCurrentDate(newDate);
      });

      expect(result.current.state.currentDate).toBe(newDate);
    });
  });
});
