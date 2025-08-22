import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdvancedFilters } from "../../components/organisms/AdvancedFilters";

describe("AdvancedFilters", () => {
  const mockOnEditEntry = vi.fn();
  const defaultProps = {
    entries: [],
    onEditEntry: mockOnEditEntry,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente", () => {
    render(<AdvancedFilters {...defaultProps} />);

    expect(screen.getByText("Tipo de Período")).toBeInTheDocument();
    expect(screen.getByText("Seleccionar Fecha")).toBeInTheDocument();
  });

  it("debe mostrar los tres botones de período", () => {
    render(<AdvancedFilters {...defaultProps} />);

    expect(screen.getByText("Día")).toBeInTheDocument();
    expect(screen.getByText("Semana")).toBeInTheDocument();
    expect(screen.getByText("Mes")).toBeInTheDocument();
  });

  it("debe mostrar el selector de fecha por defecto", () => {
    render(<AdvancedFilters {...defaultProps} />);

    // Por defecto está en modo "día", debería mostrar el selector de fecha
    expect(screen.getByText("Seleccionar Fecha")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/202\d-\d{2}-\d{2}/)).toBeInTheDocument();
  });

  it("debe renderizar correctamente sin errores", () => {
    render(<AdvancedFilters {...defaultProps} />);

    // El componente debe renderizar sin errores
    expect(screen.getByText("Tipo de Período")).toBeInTheDocument();
  });

  it("debe cambiar al período semana cuando se hace clic en Semana", () => {
    render(<AdvancedFilters {...defaultProps} />);

    fireEvent.click(screen.getByText("Semana"));

    // Verificar que se muestra el selector de semana
    expect(screen.getByText("Seleccionar Semana")).toBeInTheDocument();
  });

  it("debe cambiar al período mes cuando se hace clic en Mes", () => {
    render(<AdvancedFilters {...defaultProps} />);

    fireEvent.click(screen.getByText("Mes"));

    // Verificar que se muestra el selector de mes
    expect(screen.getByText("Seleccionar Mes")).toBeInTheDocument();
  });

  it("debe mostrar dropdown de semanas cuando se selecciona Semana", () => {
    render(<AdvancedFilters {...defaultProps} />);

    fireEvent.click(screen.getByText("Semana"));

    expect(screen.getByText("Seleccionar Semana")).toBeInTheDocument();
    expect(screen.getByText("Semana actual")).toBeInTheDocument(); // Opción por defecto
  });

  it("debe mostrar dropdown de meses cuando se selecciona Mes", () => {
    render(<AdvancedFilters {...defaultProps} />);

    fireEvent.click(screen.getByText("Mes"));

    expect(screen.getByText("Seleccionar Mes")).toBeInTheDocument();
    expect(screen.getByText("Mes actual")).toBeInTheDocument(); // Opción por defecto
  });

  it("debe cambiar la fecha cuando se selecciona una nueva fecha", () => {
    render(<AdvancedFilters {...defaultProps} />);

    const dateInput = screen.getByDisplayValue(/202\d-\d{2}-\d{2}/);
    fireEvent.change(dateInput, { target: { value: "2025-01-20" } });

    // Verificar que la fecha cambió
    expect(dateInput).toHaveValue("2025-01-20");
  });

  it("debe mostrar el resumen del período actual", () => {
    render(<AdvancedFilters {...defaultProps} />);

    expect(screen.getByText("Período Actual")).toBeInTheDocument();
    expect(
      screen.getByText(/Viendo registros de un día específico/)
    ).toBeInTheDocument();
  });

  it("debe mostrar el botón Día como activo por defecto", () => {
    render(<AdvancedFilters {...defaultProps} />);

    const dayButton = screen.getByText("Día").closest("button");
    expect(dayButton).toHaveClass("bg-blue-600");
  });

  it("debe mostrar los botones Semana y Mes como inactivos por defecto", () => {
    render(<AdvancedFilters {...defaultProps} />);

    const weekButton = screen.getByText("Semana").closest("button");
    const monthButton = screen.getByText("Mes").closest("button");

    expect(weekButton).toHaveClass("bg-gray-100");
    expect(monthButton).toHaveClass("bg-gray-100");
  });
});
