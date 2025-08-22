import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntriesByDay } from "../../components/organisms/EntriesByDay";
import {
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";

// Mock de los componentes hijos
vi.mock("../../components/molecules/EntryCard", () => ({
  EntryCard: ({
    title,
    onEdit,
    statusType,
  }: {
    title: string;
    onEdit: () => void;
    statusType?: string;
  }) => (
    <div data-testid="entry-card" onClick={onEdit} data-status={statusType}>
      {title}
    </div>
  ),
}));

// Mock de date-fns
vi.mock("date-fns", () => ({
  format: vi.fn((date) => `formatted-${date.toDateString()}`),
  isSameDay: vi.fn((date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  }),
}));

// Mock de date-fns/locale
vi.mock("date-fns/locale", () => ({
  es: {},
}));

describe("EntriesByDay", () => {
  const mockOnEditEntry = vi.fn();

  const mockEntries = [
    {
      type: "medication" as const,
      time: "10:00",
      date: "2024-01-15",
      data: {
        id: "1",
        name: "Aspirina",
        withFood: "after" as const,
        usageCount: 5,
        lastUsed: new Date("2024-01-15T10:00:00"),
      } as UserMedication,
    },
    {
      type: "glucose" as const,
      time: "12:00",
      date: "2024-01-15",
      data: {
        id: "2",
        userId: "user1",
        timestamp: new Date("2024-01-15T12:00:00"),
        value: 120,
        context: "fasting" as const,
        status: "normal" as const,
      } as GlucoseMeasurement,
    },
    {
      type: "pressure" as const,
      time: "14:00",
      date: "2024-01-14",
      data: {
        id: "3",
        userId: "user1",
        timestamp: new Date("2024-01-14T14:00:00"),
        systolic: 130,
        diastolic: 85,
        status: "normal" as const,
      } as PressureMeasurement,
    },
    {
      type: "insulin" as const,
      time: "16:00",
      date: "2024-01-14",
      data: {
        id: "4",
        userId: "user1",
        timestamp: new Date("2024-01-14T16:00:00"),
        dose: 10,
        type: "rapid" as const,
        context: "postprandial" as const,
      } as InsulinEntry,
    },
  ];

  it("debe renderizar correctamente con entradas", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("Registros por Día")).toBeInTheDocument();
    expect(screen.getByText("4 registros en total")).toBeInTheDocument();
  });

  it("debe mostrar mensaje cuando no hay entradas", () => {
    render(<EntriesByDay entries={[]} onEditEntry={mockOnEditEntry} />);

    expect(screen.getByText("No hay registros")).toBeInTheDocument();
    expect(
      screen.getByText("Comienza agregando tu primera medicación o medición")
    ).toBeInTheDocument();
    expect(screen.getByText("📝")).toBeInTheDocument();
  });

  it("debe mostrar el título correcto", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("Registros por Día")).toBeInTheDocument();
  });

  it("debe mostrar el contador correcto de registros", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("4 registros en total")).toBeInTheDocument();
  });

  it("debe renderizar entradas de medicación correctamente", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("Aspirina")).toBeInTheDocument();
  });

  it("debe renderizar entradas de glucemia correctamente", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("Glucemia: 120 mg/dL")).toBeInTheDocument();
  });

  it("debe renderizar entradas de presión correctamente", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("Presión: 130/85 mmHg")).toBeInTheDocument();
  });

  it("debe renderizar entradas de insulina correctamente", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    expect(screen.getByText("Insulina: 10 unidades")).toBeInTheDocument();
  });

  it("debe mostrar el estado correcto para las entradas de glucemia", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    const glucoseCard = screen.getByText("Glucemia: 120 mg/dL").closest("div");
    expect(glucoseCard).toHaveAttribute("data-status", "normal");
  });

  it("debe mostrar el estado correcto para las entradas de presión", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    const pressureCard = screen
      .getByText("Presión: 130/85 mmHg")
      .closest("div");
    expect(pressureCard).toHaveAttribute("data-status", "normal");
  });

  it("debe tener la clase correcta para el contenedor principal", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    const container = screen
      .getByText("Registros por Día")
      .closest("div")?.parentElement;
    expect(container).toHaveClass("space-y-6");
  });

  it("debe mostrar el número correcto de registros por día", () => {
    render(
      <EntriesByDay entries={mockEntries} onEditEntry={mockOnEditEntry} />
    );

    // Debería mostrar 2 días con diferentes cantidades de registros
    const registrosElements = screen.getAllByText(/2 registros/);
    expect(registrosElements).toHaveLength(2);
  });
});
