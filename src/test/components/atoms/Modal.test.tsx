import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../../../components/atoms/Modal";

describe("Modal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} showCloseButton={true}>
        <div>Modal Content</div>
      </Modal>
    );

    const closeButton = screen.getByRole("button", { name: /cerrar/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders title when provided", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("does not render close button when showCloseButton is false", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(
      screen.queryByRole("button", { name: /cerrar/i })
    ).not.toBeInTheDocument();
  });

  it("applies correct size classes", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} size="sm">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByTestId("modal-content")).toHaveClass("max-w-md");

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="lg">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByTestId("modal-content")).toHaveClass("max-w-2xl");
  });

  it("renders children correctly", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div data-testid="modal-children">
          <h2>Modal Title</h2>
          <p>Modal description</p>
          <button>Action Button</button>
        </div>
      </Modal>
    );

    expect(screen.getByTestId("modal-children")).toBeInTheDocument();
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
    expect(screen.getByText("Modal description")).toBeInTheDocument();
    expect(screen.getByText("Action Button")).toBeInTheDocument();
  });
});
