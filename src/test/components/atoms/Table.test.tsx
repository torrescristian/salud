import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Table } from "../../../components/atoms/Table";

interface TestData {
  id: number;
  name: string;
  age: number;
  email: string;
}

describe("Table", () => {
  const mockData: TestData[] = [
    { id: 1, name: "John Doe", age: 30, email: "john@example.com" },
    { id: 2, name: "Jane Smith", age: 25, email: "jane@example.com" },
  ];

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "age", header: "Age" },
    { key: "email", header: "Email" },
  ];

  it("renders table with data", () => {
    render(<Table columns={columns} data={mockData} />);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders empty message when no data", () => {
    render(<Table columns={columns} data={[]} />);

    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(
      <Table columns={columns} data={[]} emptyMessage="No records found" />
    );

    expect(screen.getByText("No records found")).toBeInTheDocument();
  });

  it("calls onRowClick when row is clicked", () => {
    const mockOnRowClick = vi.fn();
    render(
      <Table columns={columns} data={mockData} onRowClick={mockOnRowClick} />
    );

    const firstRow = screen.getByText("John Doe").closest("tr");
    fireEvent.click(firstRow!);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("applies custom className", () => {
    render(
      <Table columns={columns} data={mockData} className="custom-table" />
    );

    const tableContainer = screen.getByText("John Doe").closest("div");
    expect(tableContainer).toHaveClass("custom-table");
  });

  it("renders custom column renderer", () => {
    const customColumns = [
      ...columns,
      {
        key: "age",
        header: "Age",
        render: (value: number) => `${value} years old`,
      },
    ];

    render(<Table columns={customColumns} data={mockData} />);

    expect(screen.getByText("30 years old")).toBeInTheDocument();
    expect(screen.getByText("25 years old")).toBeInTheDocument();
  });

  it("applies column className", () => {
    const customColumns = [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
      {
        key: "email",
        header: "Email",
        className: "email-column",
      },
    ];

    render(<Table columns={customColumns} data={mockData} />);

    const emailCells = screen.getAllByText(/@example\.com/);
    emailCells.forEach((cell) => {
      expect(cell).toHaveClass("email-column");
    });
  });

  it("has correct table structure", () => {
    render(<Table columns={columns} data={mockData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("rowgroup")).toHaveLength(2);
  });

  it("applies hover styles when onRowClick is provided", () => {
    const mockOnRowClick = vi.fn();
    render(
      <Table columns={columns} data={mockData} onRowClick={mockOnRowClick} />
    );

    const rows = screen.getAllByRole("row");
    rows.slice(1).forEach((row) => {
      // Skip header row
      expect(row).toHaveClass("cursor-pointer", "hover:bg-gray-50");
    });
  });
});
