import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdvancedFilters } from "../../components/organisms/AdvancedFilters";

describe("AdvancedFilters", () => {
  const mockOnPeriodChange = vi.fn();
  const defaultProps = {
    onPeriodChange: mockOnPeriodChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente", () => {
    render(<AdvancedFilters {...defaultProps} />);

    expect(screen.getByText("Filtros Avanzados")).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona el período que deseas visualizar")
    ).toBeInTheDocument();
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

  it("debe llamar onPeriodChange automáticamente al renderizar", () => {
    render(<AdvancedFilters {...defaultProps} />);

    // El componente debe llamar automáticamente a onPeriodChange cuando se monta
    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "day",
      expect.any(Date),
      expect.any(Date)
    );
  });

  it("debe cambiar al período semana cuando se hace clic en Semana", () => {
    render(<AdvancedFilters {...defaultProps} />);
    vi.clearAllMocks(); // Limpiar la llamada inicial

    fireEvent.click(screen.getByText("Semana"));

    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "week",
      expect.any(Date),
      expect.any(Date)
    );
  });

  it("debe cambiar al período mes cuando se hace clic en Mes", () => {
    render(<AdvancedFilters {...defaultProps} />);
    vi.clearAllMocks(); // Limpiar la llamada inicial

    fireEvent.click(screen.getByText("Mes"));

    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "month",
      expect.any(Date),
      expect.any(Date)
    );
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

  it("debe aplicar fecha automáticamente cuando se cambia la fecha", () => {
    render(<AdvancedFilters {...defaultProps} />);
    vi.clearAllMocks(); // Limpiar la llamada inicial

    const dateInput = screen.getByDisplayValue(/202\d-\d{2}-\d{2}/);
    fireEvent.change(dateInput, { target: { value: "2025-01-20" } });

    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "day",
      expect.any(Date),
      expect.any(Date)
    );
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
