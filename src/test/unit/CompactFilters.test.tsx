import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompactFilters } from "../../components/molecules/CompactFilters";

describe("CompactFilters", () => {
  const mockOnPeriodChange = vi.fn();

  const defaultProps = {
    onPeriodChange: mockOnPeriodChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders period selection buttons", () => {
    render(<CompactFilters {...defaultProps} />);

    expect(screen.getByText("Día")).toBeInTheDocument();
    expect(screen.getByText("Semana")).toBeInTheDocument();
    expect(screen.getByText("Mes")).toBeInTheDocument();
  });

  it("shows date input when day period is selected", () => {
    render(<CompactFilters {...defaultProps} />);

    const dayButton = screen.getByText("Día");
    fireEvent.click(dayButton);

    // After clicking day, should show date input
    const dateInput = screen.getByDisplayValue("2025-08-22");
    expect(dateInput).toBeInTheDocument();
  });

  it("shows week selector when week period is selected", () => {
    render(<CompactFilters {...defaultProps} />);

    const weekButton = screen.getByText("Semana");
    fireEvent.click(weekButton);

    expect(screen.getByText("Semana actual")).toBeInTheDocument();
  });

  it("shows month selector when month period is selected", () => {
    render(<CompactFilters {...defaultProps} />);

    const monthButton = screen.getByText("Mes");
    fireEvent.click(monthButton);

    expect(screen.getByText("Mes actual")).toBeInTheDocument();
  });

  it("calls onPeriodChange with correct parameters when day is selected", () => {
    render(<CompactFilters {...defaultProps} />);

    const dayButton = screen.getByText("Día");
    fireEvent.click(dayButton);

    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "day",
      expect.any(Date),
      expect.any(Date)
    );
  });

  it("calls onPeriodChange with correct parameters when week is selected", () => {
    render(<CompactFilters {...defaultProps} />);

    const weekButton = screen.getByText("Semana");
    fireEvent.click(weekButton);

    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "week",
      expect.any(Date),
      expect.any(Date)
    );
  });

  it("calls onPeriodChange with correct parameters when month is selected", () => {
    render(<CompactFilters {...defaultProps} />);

    const monthButton = screen.getByText("Mes");
    fireEvent.click(monthButton);

    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "month",
      expect.any(Date),
      expect.any(Date)
    );
  });

  it("generates week options for the last 8 weeks", () => {
    render(<CompactFilters {...defaultProps} />);

    const weekButton = screen.getByText("Semana");
    fireEvent.click(weekButton);

    const weekSelect = screen.getByDisplayValue("Semana actual");
    expect(weekSelect).toBeInTheDocument();

    // Should have at least 8 week options plus "Semana actual"
    const options = weekSelect.querySelectorAll("option");
    expect(options.length).toBeGreaterThanOrEqual(9);
  });

  it("generates month options for the last 6 months", () => {
    render(<CompactFilters {...defaultProps} />);

    const monthButton = screen.getByText("Mes");
    fireEvent.click(monthButton);

    const monthSelect = screen.getByDisplayValue("Mes actual");
    expect(monthSelect).toBeInTheDocument();

    // Should have at least 6 month options plus "Mes actual"
    const options = monthSelect.querySelectorAll("option");
    expect(options.length).toBeGreaterThanOrEqual(7);
  });

  it("applies correct styling to selected period button", () => {
    render(<CompactFilters {...defaultProps} />);

    const dayButton = screen.getByText("Día");
    fireEvent.click(dayButton);

    // Day button should have selected styling
    expect(dayButton).toHaveClass("bg-blue-600", "text-white");

    // Other buttons should have default styling
    const weekButton = screen.getByText("Semana");
    const monthButton = screen.getByText("Mes");

    expect(weekButton).toHaveClass("bg-gray-100", "text-gray-700");
    expect(monthButton).toHaveClass("bg-gray-100", "text-gray-700");
  });

  it("handles date input change correctly", () => {
    render(<CompactFilters {...defaultProps} />);

    // First click day to show date input
    const dayButton = screen.getByText("Día");
    fireEvent.click(dayButton);

    const dateInput = screen.getByDisplayValue("2025-08-22");
    const testDate = "2024-01-15";
    fireEvent.change(dateInput, { target: { value: testDate } });

    expect(dateInput).toHaveValue(testDate);
  });

  it("handles week selection change correctly", () => {
    render(<CompactFilters {...defaultProps} />);

    const weekButton = screen.getByText("Semana");
    fireEvent.click(weekButton);

    const weekSelect = screen.getByDisplayValue("Semana actual");
    fireEvent.change(weekSelect, { target: { value: "2024-01-15" } });

    // Should call onPeriodChange with the new week value
    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "week",
      expect.any(Date),
      expect.any(Date)
    );
  });

  it("handles month selection change correctly", () => {
    render(<CompactFilters {...defaultProps} />);

    const monthButton = screen.getByText("Mes");
    fireEvent.click(monthButton);

    const monthSelect = screen.getByDisplayValue("Mes actual");
    fireEvent.change(monthSelect, { target: { value: "2024-01-01" } });

    // Should call onPeriodChange with the new month value
    expect(mockOnPeriodChange).toHaveBeenCalledWith(
      "month",
      expect.any(Date),
      expect.any(Date)
    );
  });
});
