import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodEntryFormWithQuery } from '../../../components/molecules/FoodEntryFormWithQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hooks
vi.mock('@/hooks', () => ({
  useCreateFoodEntry: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe('FoodEntryFormWithQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders form fields', () => {
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" />
    );
    
    expect(screen.getByText('Nueva Entrada de Comida')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Comida')).toBeInTheDocument();
    expect(screen.getByLabelText('Emoji')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad (gramos)')).toBeInTheDocument();
    expect(screen.getByLabelText('Notas (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar Entrada' })).toBeInTheDocument();
  });

  it('shows food type options', () => {
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" />
    );
    
    const foodTypeSelect = screen.getByLabelText('Tipo de Comida');
    expect(foodTypeSelect).toBeInTheDocument();
    
    // Check that all food type options are present
    expect(screen.getByText('Carbohidratos')).toBeInTheDocument();
    expect(screen.getByText('Proteínas')).toBeInTheDocument();
    expect(screen.getByText('Verduras')).toBeInTheDocument();
    expect(screen.getByText('Huevos')).toBeInTheDocument();
    expect(screen.getByText('Lácteos')).toBeInTheDocument();
  });

  it('shows emoji options', () => {
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" />
    );
    
    const emojiSelect = screen.getByLabelText('Emoji');
    expect(emojiSelect).toBeInTheDocument();
    
    // Check that some emoji options are present
    expect(screen.getByText('🍞 Pan')).toBeInTheDocument();
    expect(screen.getByText('🍗 Pollo')).toBeInTheDocument();
    expect(screen.getByText('🥬 Lechuga')).toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    const mockOnCancel = vi.fn();
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" onCancel={mockOnCancel} />
    );
    
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" />
    );
    
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('applies initial data when provided', () => {
    const initialData = {
      foodType: 'proteins' as const,
      description: 'Pollo a la plancha',
      quantity: 150,
      emoji: '🍗',
      notes: 'Comida saludable',
    };
    
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" initialData={initialData} />
    );
    
    expect(screen.getByDisplayValue('Pollo a la plancha')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Comida saludable')).toBeInTheDocument();
  });

  it('has correct form validation attributes', () => {
    renderWithQueryClient(
      <FoodEntryFormWithQuery userId="test-user" />
    );
    
    const quantityInput = screen.getByLabelText('Cantidad (gramos)');
    expect(quantityInput).toHaveAttribute('type', 'number');
    expect(quantityInput).toHaveAttribute('min', '1');
    expect(quantityInput).toHaveAttribute('step', '1');
    
    const descriptionInput = screen.getByLabelText('Descripción');
    expect(descriptionInput).toHaveAttribute('type', 'text');
  });
});
