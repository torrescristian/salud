import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GlucoseMeasurementForm } from "../../../components/molecules/GlucoseMeasurementForm";

describe("GlucoseMeasurementForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", () => {
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByLabelText("Valor de Glucosa (mg/dL)")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Contexto de la Medición")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Notas (opcional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar Medición" })
    ).toBeInTheDocument();
  });

  it.skip('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} />);
    
    // Hacer submit directamente para activar la validación
    const submitButton = screen.getByRole('button', { name: 'Guardar Medición' });
    await user.click(submitButton);
    
    // Verificar que ambos errores están presentes
    await waitFor(() => {
      expect(screen.getByText('El valor de glucosa es requerido')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('El contexto es requerido')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText('Valor de Glucosa (mg/dL)'), '120');
    await user.selectOptions(screen.getByLabelText('Contexto de la Medición'), 'fasting');
    await user.type(screen.getByLabelText('Notas (opcional)'), 'Test note');
    
    const submitButton = screen.getByRole('button', { name: 'Guardar Medición' });
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      value: 120,
      context: 'fasting',
      notes: 'Test note'
    });
  });

  it('shows cancel button when onCancel is provided', () => {
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('applies initial data when provided', () => {
    const initialData = {
      value: 100,
      context: 'postPrandial' as const,
      notes: 'Initial note'
    };
    
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    // Verificar que los valores están en el DOM
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial note')).toBeInTheDocument();
    
    // Para el select, verificar que la opción correcta está seleccionada
    const contextSelect = screen.getByLabelText('Contexto de la Medición') as HTMLSelectElement;
    expect(contextSelect.value).toBe('postPrandial');
  });

  it.skip('validates glucose value range', async () => {
    const user = userEvent.setup();
    render(<GlucoseMeasurementForm onSubmit={mockOnSubmit} />);
    
    const valueInput = screen.getByLabelText('Valor de Glucosa (mg/dL)');
    await user.type(valueInput, '-10');
    await user.selectOptions(screen.getByLabelText('Contexto de la Medición'), 'fasting');
    
    // Hacer blur para activar validación
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('El valor debe ser positivo')).toBeInTheDocument();
    });
  });
});
