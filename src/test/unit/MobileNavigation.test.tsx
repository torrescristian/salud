import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  MobileNavigation,
  NavigationTab,
} from "../../components/organisms/MobileNavigation";

describe("MobileNavigation", () => {
  const mockOnTabChange = vi.fn();
  const defaultProps = {
    activeTab: "home" as NavigationTab,
    onTabChange: mockOnTabChange,
  };

  it("debe renderizar correctamente", () => {
    render(<MobileNavigation {...defaultProps} />);

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Analítica")).toBeInTheDocument();
  });

  it("debe mostrar la pestaña activa destacada", () => {
    render(<MobileNavigation {...defaultProps} />);

    const homeTab = screen.getByText("Inicio").closest("button");
    expect(homeTab).toHaveClass("text-blue-600", "bg-blue-50");
  });

  it("debe cambiar a la pestaña de filtros cuando se hace clic", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(screen.getByText("Filtros"));

    expect(mockOnTabChange).toHaveBeenCalledWith("filters");
  });

  it("debe cambiar a la pestaña de analítica cuando se hace clic", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(screen.getByText("Analítica"));

    expect(mockOnTabChange).toHaveBeenCalledWith("analytics");
  });

  it("debe cambiar a la pestaña de inicio cuando se hace clic", () => {
    render(<MobileNavigation {...defaultProps} />);

    fireEvent.click(screen.getByText("Inicio"));

    expect(mockOnTabChange).toHaveBeenCalledWith("home");
  });

  it("debe mostrar la pestaña de filtros como activa cuando activeTab es filters", () => {
    render(<MobileNavigation {...defaultProps} activeTab="filters" />);

    const filtersTab = screen.getByText("Filtros").closest("button");
    expect(filtersTab).toHaveClass("text-blue-600", "bg-blue-50");
  });

  it("debe mostrar la pestaña de analítica como activa cuando activeTab es analytics", () => {
    render(<MobileNavigation {...defaultProps} activeTab="analytics" />);

    const analyticsTab = screen.getByText("Analítica").closest("button");
    expect(analyticsTab).toHaveClass("text-blue-600", "bg-blue-50");
  });

  it("debe tener la clase correcta para pestañas inactivas", () => {
    render(<MobileNavigation {...defaultProps} />);

    const filtersTab = screen.getByText("Filtros").closest("button");
    expect(filtersTab).toHaveClass("text-gray-500");
  });

  it("debe estar fijado en la parte inferior de la pantalla", () => {
    render(<MobileNavigation {...defaultProps} />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed", "bottom-0");
  });
});
