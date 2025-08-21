import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NutritionManagement } from "../../../components/organisms/NutritionManagement";

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
  useCreateFoodEntry: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useUpdateFoodEntry: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  useDeleteFoodEntry: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe("NutritionManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nutrition management interface", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Gestión de Nutrición")).toBeInTheDocument();
    expect(screen.getByText("Agregar Nueva Entrada")).toBeInTheDocument();
    expect(screen.getByText("Entradas de Comida")).toBeInTheDocument();
  });

  it("shows add new entry button", () => {
    render(<NutritionManagement userId="user-1" />);

    const addButton = screen.getByRole("button", { name: /agregar nueva entrada/i });
    expect(addButton).toBeInTheDocument();
  });

  it("displays food entries list", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Pollo a la plancha")).toBeInTheDocument();
    expect(screen.getByText("Ensalada mixta")).toBeInTheDocument();
    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getByText("100g")).toBeInTheDocument();
  });

  it("shows food type labels correctly", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Proteínas")).toBeInTheDocument();
    expect(screen.getByText("Verduras")).toBeInTheDocument();
  });

  it("displays emojis for food entries", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("🍗")).toBeInTheDocument();
    expect(screen.getByText("🥬")).toBeInTheDocument();
  });

  it("shows notes when available", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Comida saludable")).toBeInTheDocument();
    expect(screen.getByText("Con aceite de oliva")).toBeInTheDocument();
  });

  it("has edit and delete buttons for each entry", () => {
    render(<NutritionManagement userId="user-1" />);

    const editButtons = screen.getAllByRole("button", { name: /editar/i });
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it("opens add entry form when add button is clicked", () => {
    render(<NutritionManagement userId="user-1" />);

    const addButton = screen.getByRole("button", { name: /agregar nueva entrada/i });
    fireEvent.click(addButton);

    expect(screen.getByText("Nueva Entrada de Comida")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de Comida")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
  });

  it("closes add entry form when cancel is clicked", () => {
    render(<NutritionManagement userId="user-1" />);

    const addButton = screen.getByRole("button", { name: /agregar nueva entrada/i });
    fireEvent.click(addButton);

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Nueva Entrada de Comida")).not.toBeInTheDocument();
  });

  it("handles empty entries list", () => {
    vi.mocked(require("@/hooks").useFoodEntries).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<NutritionManagement userId="user-1" />);

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

    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Cargando entradas de comida...")).toBeInTheDocument();
  });

  it("handles error state", () => {
    vi.mocked(require("@/hooks").useFoodEntries).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<NutritionManagement userId="user-1" />);

    expect(
      screen.getByText("Error al cargar las entradas de comida")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Por favor, intenta nuevamente más tarde")
    ).toBeInTheDocument();
  });

  it("shows nutrition summary when data is available", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Resumen Nutricional")).toBeInTheDocument();
    expect(screen.getByText("Total de Entradas: 2")).toBeInTheDocument();
  });

  it("displays food type distribution", () => {
    render(<NutritionManagement userId="user-1" />);

    expect(screen.getByText("Proteínas: 1")).toBeInTheDocument();
    expect(screen.getByText("Verduras: 1")).toBeInTheDocument();
  });
});
