import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FoodEntriesList } from "../../../components/molecules/FoodEntriesList";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useFoodEntries: () => ({
    data: [
      {
        id: "1",
        userId: "user-1",
        foodType: "proteins",
        description: "Pollo a la plancha",
        quantity: 150,
        emoji: "🍗",
        notes: "Comida saludable",
        timestamp: new Date("2024-01-01"),
      },
      {
        id: "2",
        userId: "user-1",
        foodType: "vegetables",
        description: "Ensalada mixta",
        quantity: 100,
        emoji: "🥬",
        notes: "Con aceite de oliva",
        timestamp: new Date("2024-01-01T12:00:00"),
      },
    ],
    isLoading: false,
    error: null,
  }),
  useDeleteFoodEntry: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe("FoodEntriesList", () => {
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders food entries list", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("Pollo a la plancha")).toBeInTheDocument();
    expect(screen.getByText("Ensalada mixta")).toBeInTheDocument();
    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getByText("100g")).toBeInTheDocument();
  });

  it("displays food type labels correctly", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("Proteínas")).toBeInTheDocument();
    expect(screen.getByText("Verduras")).toBeInTheDocument();
  });

  it("shows emojis for food entries", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("🍗")).toBeInTheDocument();
    expect(screen.getByText("🥬")).toBeInTheDocument();
  });

  it("displays notes when available", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("Comida saludable")).toBeInTheDocument();
    expect(screen.getByText("Con aceite de oliva")).toBeInTheDocument();
  });

  it("shows quantity in grams", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getByText("100g")).toBeInTheDocument();
  });

  it("has edit buttons for each entry", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole("button", { name: /editar/i });
    expect(editButtons).toHaveLength(2);
  });

  it("has delete buttons for each entry", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    const editButtons = screen.getAllByRole("button", { name: /editar/i });
    editButtons[0].click();

    expect(mockOnEdit).toHaveBeenCalledWith({
      id: "1",
      userId: "user-1",
      foodType: "proteins",
      description: "Pollo a la plancha",
      quantity: 150,
      emoji: "🍗",
      notes: "Comida saludable",
      timestamp: expect.any(Date),
    });
  });

  it("handles empty entries list", () => {
    vi.mocked(require("@/hooks").useFoodEntries).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(
      screen.getByText("No hay entradas de comida registradas")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Agrega tu primera entrada para comenzar")
    ).toBeInTheDocument();
  });

  it("handles loading state", () => {
    vi.mocked(require("@/hooks").useFoodEntries).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(
      screen.getByText("Cargando entradas de comida...")
    ).toBeInTheDocument();
  });

  it("handles error state", () => {
    vi.mocked(require("@/hooks").useFoodEntries).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<FoodEntriesList userId="user-1" onEdit={mockOnEdit} />);

    expect(
      screen.getByText("Error al cargar las entradas de comida")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Por favor, intenta nuevamente más tarde")
    ).toBeInTheDocument();
  });
});
