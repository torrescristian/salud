import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HealthApp } from "../../components/HealthApp";

// Mock localStorage simple
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("HealthApp Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, no hay perfil
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("Flujo de Configuración Inicial", () => {
    it("debe mostrar el formulario de configuración inicial si no hay perfil", () => {
      render(<HealthApp />);
      expect(screen.getByText("Configuración Inicial")).toBeInTheDocument();
      expect(screen.getByText("Configurar Perfil")).toBeInTheDocument();
    });

    it("debe crear perfil inicial y mostrar la aplicación principal", async () => {
      render(<HealthApp />);

      // Hacer clic en "Configurar Perfil" para abrir el modal
      fireEvent.click(screen.getByText("Configurar Perfil"));

      await waitFor(() => {
        expect(
          screen.getByRole("textbox", { name: /nombre/i })
        ).toBeInTheDocument();
      });

      fireEvent.change(screen.getByRole("textbox", { name: /nombre/i }), {
        target: { value: "Juan Pérez" },
      });

      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(screen.getByText("Control Médico")).toBeInTheDocument();
      });
    });
  });

  describe("Aplicación Principal (con perfil existente)", () => {
    beforeEach(() => {
      // Mock del perfil existente
      const userProfile = {
        id: "test-user",
        name: "Juan Pérez",
        criticalGlucose: { min: 70, max: 180 },
        criticalPressure: {
          systolic: { min: 90, max: 140 },
          diastolic: { min: 60, max: 90 },
        },
      };

      // Mock de todos los datos necesarios
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        switch (key) {
          case "user_profile":
            return JSON.stringify(userProfile);
          case "daily_entries":
            return JSON.stringify([]);
          case "user_medications":
            return JSON.stringify([]);
          case "glucose_measurements":
            return JSON.stringify([]);
          case "pressure_measurements":
            return JSON.stringify([]);
          case "insulin_entries":
            return JSON.stringify([]);
          default:
            return null;
        }
      });
    });

    it("debe mostrar la interfaz principal cuando hay perfil", () => {
      render(<HealthApp />);
      expect(screen.getByText("Control Médico")).toBeInTheDocument();
      expect(screen.getByText("Medicación")).toBeInTheDocument();
      expect(screen.getByText("Glucemia")).toBeInTheDocument();
      expect(screen.getByText("Presión")).toBeInTheDocument();
      expect(screen.getByText("Insulina")).toBeInTheDocument();
    });

    it("debe abrir modal de medicación", async () => {
      render(<HealthApp />);

      fireEvent.click(screen.getByText("Medicación"));

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Registrar Medicación" })
        ).toBeInTheDocument();
      });
    });

    it("debe abrir modal de glucemia", async () => {
      render(<HealthApp />);

      fireEvent.click(screen.getByText("Glucemia"));

      await waitFor(() => {
        expect(screen.getByText("Registrar Glucemia")).toBeInTheDocument();
      });
    });

    it("debe abrir modal de presión", async () => {
      render(<HealthApp />);

      fireEvent.click(screen.getByText("Presión"));

      await waitFor(() => {
        expect(
          screen.getByText("Registrar Presión Arterial")
        ).toBeInTheDocument();
      });
    });

    it("debe abrir modal de insulina", async () => {
      render(<HealthApp />);

      fireEvent.click(screen.getByText("Insulina"));

      await waitFor(() => {
        expect(screen.getByText("Registrar Insulina")).toBeInTheDocument();
      });
    });
  });
});
