import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../../../components/atoms/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Cargando");

    const srText = screen.getByText("Cargando...");
    expect(srText).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toHaveClass("w-4", "h-4");

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole("status")).toHaveClass("w-6", "h-6");

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("w-8", "h-8");
  });

  it("renders with different colors", () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByRole("status")).toHaveClass("text-blue-600");

    rerender(<LoadingSpinner color="secondary" />);
    expect(screen.getByRole("status")).toHaveClass("text-gray-600");

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole("status")).toHaveClass("text-white");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-class" />);
    expect(screen.getByRole("status")).toHaveClass("custom-class");
  });

  it("has correct animation classes", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("animate-spin");
    expect(spinner).toHaveClass("border-t-transparent");
  });
});
