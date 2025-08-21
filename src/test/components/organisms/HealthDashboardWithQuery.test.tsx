import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthDashboardWithQuery } from "../../../components/organisms/HealthDashboardWithQuery";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useUserProfile: () => ({
    data: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      age: 30,
      weight: 70,
      height: 175,
    },
    isLoading: false,
    error: null,
  }),
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
    ],
    isLoading: false,
    error: null,
  }),
  usePressureMeasurements: () => ({
    data: [
      {
        id: "1",
        userId: "user-1",
        systolic: 120,
        diastolic: 80,
        timestamp: new Date("2024-01-01"),
        notes: "Morning reading",
      },
    ],
    isLoading: false,
    error: null,
  }),
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
    ],
    isLoading: false,
    error: null,
  }),
  useMedicalViews: () => ({
    data: [
      {
        id: "1",
        userId: "user-1",
        timestamp: new Date("2024-01-01"),
        summary: {
          averageGlucose: 120,
          averageSystolic: 120,
          averageDiastolic: 80,
          totalCalories: 1500,
          healthScore: 85,
        },
        trends: {
          glucoseTrend: "stable",
          pressureTrend: "stable",
          nutritionTrend: "improving",
        },
        alerts: [
          {
            type: "info",
            message: "Tu salud está en buen estado",
            severity: "low",
          },
        ],
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe("HealthDashboardWithQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user profile information", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("30 años")).toBeInTheDocument();
    expect(screen.getByText("70 kg")).toBeInTheDocument();
    expect(screen.getByText("175 cm")).toBeInTheDocument();
  });

  it("renders health metrics cards", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("Glucosa")).toBeInTheDocument();
    expect(screen.getByText("Presión Arterial")).toBeInTheDocument();
    expect(screen.getByText("Nutrición")).toBeInTheDocument();
    expect(screen.getByText("Vista Médica")).toBeInTheDocument();
  });

  it("displays glucose measurement data", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("120 mg/dL")).toBeInTheDocument();
    expect(screen.getByText("En ayunas")).toBeInTheDocument();
  });

  it("displays pressure measurement data", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("120/80 mmHg")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("displays food entry data", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("Pollo a la plancha")).toBeInTheDocument();
    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getByText("🍗")).toBeInTheDocument();
  });

  it("displays medical view summary", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("Puntuación de Salud")).toBeInTheDocument();
  });

  it("shows health trends", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("Estable")).toBeInTheDocument();
    expect(screen.getByText("Mejorando")).toBeInTheDocument();
  });

  it("displays health alerts", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(
      screen.getByText("Tu salud está en buen estado")
    ).toBeInTheDocument();
  });

  it("handles loading state for user profile", () => {
    vi.mocked(require("@/hooks").useUserProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("Cargando perfil...")).toBeInTheDocument();
  });

  it("handles error state for user profile", () => {
    vi.mocked(require("@/hooks").useUserProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    });

    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(
      screen.getByText("Error al cargar el perfil del usuario")
    ).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    vi.mocked(require("@/hooks").useGlucoseMeasurements).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    vi.mocked(require("@/hooks").usePressureMeasurements).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    vi.mocked(require("@/hooks").useFoodEntries).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("calculates BMI correctly", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    // BMI = weight (kg) / (height (m))²
    // BMI = 70 / (1.75)² = 70 / 3.0625 = 22.86
    expect(screen.getByText("22.9")).toBeInTheDocument();
    expect(screen.getByText("IMC")).toBeInTheDocument();
  });

  it("shows appropriate health status based on metrics", () => {
    render(<HealthDashboardWithQuery userId="user-1" />);

    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Saludable")).toBeInTheDocument();
  });
});
