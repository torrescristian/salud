import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../../../components/atoms/Badge";

describe("Badge", () => {
  it("renders with default props", () => {
    render(<Badge>Test Badge</Badge>);

    const badge = screen.getByText("Test Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      "bg-blue-100",
      "text-blue-800",
      "border-blue-200"
    );
    expect(badge).toHaveClass("px-3", "py-1.5", "text-sm");
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass(
      "bg-green-100",
      "text-green-800",
      "border-green-200"
    );

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText("Warning")).toHaveClass(
      "bg-yellow-100",
      "text-yellow-800",
      "border-yellow-200"
    );

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toHaveClass(
      "bg-red-100",
      "text-red-800",
      "border-red-200"
    );

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveClass(
      "bg-gray-100",
      "text-gray-800",
      "border-gray-200"
    );
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toHaveClass("px-2", "py-1", "text-xs");

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText("Medium")).toHaveClass("px-3", "py-1.5", "text-sm");

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText("Large")).toHaveClass("px-4", "py-2", "text-base");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-class");
  });

  it("renders children correctly", () => {
    render(
      <Badge>
        Complex <strong>Content</strong>
      </Badge>
    );
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("has correct base classes", () => {
    render(<Badge>Base</Badge>);
    const badge = screen.getByText("Base");
    expect(badge).toHaveClass(
      "inline-flex",
      "items-center",
      "font-medium",
      "rounded-full",
      "border"
    );
  });
});
