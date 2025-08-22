import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthApp } from "../../components/HealthApp";
import { QueryProvider } from "../../providers/QueryProvider";

// Mock localStorage más robusto
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock más completo del localStorage
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock de crypto para los IDs
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => "test-uuid-" + Math.random().toString(36).substr(2, 9),
  },
  writable: true,
});

describe("HealthApp Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, no hay perfil
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  describe("Tests Básicos de Renderizado", () => {
    it("debe renderizar sin errores", () => {
      expect(() => {
        render(
          <QueryProvider>
            <HealthApp />
          </QueryProvider>
        );
      }).not.toThrow();
    });

    it("debe mostrar la pantalla de configuración inicial", () => {
      render(
        <QueryProvider>
          <HealthApp />
        </QueryProvider>
      );
      
      expect(screen.getByText("Configuración Inicial")).toBeInTheDocument();
      expect(screen.getByText("Configurar Perfil")).toBeInTheDocument();
    });

    it("debe mostrar el mensaje de configuración", () => {
      render(
        <QueryProvider>
          <HealthApp />
        </QueryProvider>
      );
      
      expect(screen.getByText(/Para comenzar, necesitamos configurar/)).toBeInTheDocument();
    });
  });
});
