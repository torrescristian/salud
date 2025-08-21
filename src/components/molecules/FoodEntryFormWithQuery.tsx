import React from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Button, Card } from '../atoms';
import { useCreateFoodEntry } from '@/hooks';

export interface FoodEntryFormData {
  foodType: 'carbohydrates' | 'proteins' | 'vegetables' | 'eggs' | 'dairy';
  description: string;
  quantity: number;
  emoji: string;
  notes?: string;
}

export interface FoodEntryFormWithQueryProps {
  userId: string;
  onSuccess?: (entry: any) => void;
  onCancel?: () => void;
  initialData?: Partial<FoodEntryFormData>;
}

const foodTypeOptions = [
  { value: 'carbohydrates', label: 'Carbohidratos' },
  { value: 'proteins', label: 'Proteínas' },
  { value: 'vegetables', label: 'Verduras' },
  { value: 'eggs', label: 'Huevos' },
  { value: 'dairy', label: 'Lácteos' },
];

const emojiOptions = [
  { value: '🍞', label: '🍞 Pan' },
  { value: '🍚', label: '🍚 Arroz' },
  { value: '🥔', label: '🥔 Papa' },
  { value: '🍗', label: '🍗 Pollo' },
  { value: '🥩', label: '🥩 Carne' },
  { value: '🐟', label: '🐟 Pescado' },
  { value: '🥬', label: '🥬 Lechuga' },
  { value: '🥕', label: '🥕 Zanahoria' },
  { value: '🥚', label: '🥚 Huevo' },
  { value: '🥛', label: '🥛 Leche' },
  { value: '🧀', label: '🧀 Queso' },
];

export const FoodEntryFormWithQuery: React.FC<FoodEntryFormWithQueryProps> = ({
  userId,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const createMutation = useCreateFoodEntry();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FoodEntryFormData>({
    defaultValues: initialData,
    mode: 'onBlur',
  });

  const handleFormSubmit = async (data: FoodEntryFormData) => {
    try {
      const entryData = {
        userId,
        foodType: data.foodType,
        description: data.description,
        quantity: Number(data.quantity),
        emoji: data.emoji,
        notes: data.notes,
      };

      const newEntry = await createMutation.mutateAsync(entryData);
      
      reset();
      onSuccess?.(newEntry);
    } catch (error) {
      console.error('Error creating food entry:', error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Nueva Entrada de Comida
        </h3>

        {createMutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al guardar la entrada. Por favor, intenta nuevamente.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Comida"
            options={foodTypeOptions}
            error={errors.foodType?.message}
            {...register('foodType', {
              required: 'El tipo de comida es requerido',
            })}
          />

          <Select
            label="Emoji"
            options={emojiOptions}
            error={errors.emoji?.message}
            {...register('emoji', {
              required: 'El emoji es requerido',
            })}
          />
        </div>

        <Input
          label="Descripción"
          placeholder="Ej: Pollo a la plancha, Ensalada mixta..."
          error={errors.description?.message}
          {...register('description', {
            required: 'La descripción es requerida',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
          })}
        />

        <Input
          label="Cantidad (gramos)"
          type="number"
          step="1"
          min="1"
          error={errors.quantity?.message}
          {...register('quantity', {
            required: 'La cantidad es requerida',
            min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
            max: { value: 5000, message: 'La cantidad parece ser muy alta' },
          })}
        />

        <Input
          label="Notas (opcional)"
          placeholder="Agregar notas sobre la comida..."
          {...register('notes')}
        />

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
            disabled={!isValid || createMutation.isPending}
          >
            Guardar Entrada
          </Button>
        </div>
      </form>
    </Card>
  );
};
