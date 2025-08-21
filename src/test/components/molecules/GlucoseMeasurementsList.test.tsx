import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlucoseMeasurementsList } from "../../../components/molecules/GlucoseMeasurementsList";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useGlucoseMeasurements: () => ({
    data: [
      {
        id: "1",
        userId: "user-1",
        value: 120,
        context: "fasting",
        timestamp: new Date("2024-01-01"),
        notes: "Morning reading",
      },
      {
        id: "2",
        userId: "user-1",
        value: 140,
        context: "postPrandial",
        timestamp: new Date("2024-01-01T12:00:00"),
        notes: "After lunch",
      },
    ],
    isLoading: false,
    error: null,
  }),
  useDeleteGlucoseMeasurement: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe("GlucoseMeasurementsList", () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders glucose measurements list", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("120 mg/dL")).toBeInTheDocument();
    expect(screen.getByText("140 mg/dL")).toBeInTheDocument();
    expect(screen.getByText("Morning reading")).toBeInTheDocument();
    expect(screen.getByText("After lunch")).toBeInTheDocument();
  });

  it("displays context labels correctly", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("En ayunas")).toBeInTheDocument();
    expect(screen.getByText("Postprandial")).toBeInTheDocument();
  });

  it("shows measurement values with units", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("120 mg/dL")).toBeInTheDocument();
    expect(screen.getByText("140 mg/dL")).toBeInTheDocument();
  });

  it("displays notes when available", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("Morning reading")).toBeInTheDocument();
    expect(screen.getByText("After lunch")).toBeInTheDocument();
  });

  it("has edit buttons for each measurement", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole("button", { name: /editar/i });
    expect(editButtons).toHaveLength(2);
  });

  it("has delete buttons for each measurement", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole("button", { name: /editar/i });
    editButtons[0].click();

    expect(mockOnEdit).toHaveBeenCalledWith({
      id: "1",
      userId: "user-1",
      value: 120,
      context: "fasting",
      timestamp: expect.any(Date),
      notes: "Morning reading",
    });
  });

  it("handles empty measurements list", () => {
    vi.mocked(require("@/hooks").useGlucoseMeasurements).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(
      screen.getByText("No hay mediciones de glucosa registradas")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Agrega tu primera medición para comenzar")
    ).toBeInTheDocument();
  });

  it("handles loading state", () => {
    vi.mocked(require("@/hooks").useGlucoseMeasurements).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(
      screen.getByText("Cargando mediciones de glucosa...")
    ).toBeInTheDocument();
  });

  it("handles error state", () => {
    vi.mocked(require("@/hooks").useGlucoseMeasurements).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<GlucoseMeasurementsList userId="user-1" onEdit={mockOnEdit} />);

    expect(
      screen.getByText("Error al cargar las mediciones de glucosa")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Por favor, intenta nuevamente más tarde")
    ).toBeInTheDocument();
  });
});
