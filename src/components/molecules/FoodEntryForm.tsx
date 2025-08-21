import React from "react";
import { useForm } from "react-hook-form";
import { Input, Select, Button, Card } from "../atoms";

export interface FoodEntryFormData {
  description: string;
  foodType?: "carbohydrates" | "proteins" | "vegetables" | "eggs" | "dairy";
  quantity: number;
  notes?: string;
}

export interface FoodEntryFormProps {
  onSubmit: (data: FoodEntryFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<FoodEntryFormData>;
}

const foodTypeOptions = [
  { value: "carbohydrates", label: "🍞 Carbohidratos" },
  { value: "proteins", label: "🍗 Proteínas" },
  { value: "vegetables", label: "🥦 Vegetales" },
  { value: "eggs", label: "🥚 Huevos" },
  { value: "dairy", label: "🥛 Lácteos" },
];

export const FoodEntryForm: React.FC<FoodEntryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FoodEntryFormData>({
    defaultValues: initialData,
    mode: "onChange",
  });

  const watchedDescription = watch("description");
  const shouldAutoCategorize = !initialData?.foodType && watchedDescription;

  const handleFormSubmit = (data: FoodEntryFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Nueva Entrada de Alimento
        </h3>

        <Input
          label="Descripción del Alimento"
          placeholder="Ej: Pollo a la plancha, Arroz integral..."
          error={errors.description?.message}
          {...register("description", {
            required: "La descripción es requerida",
            minLength: {
              value: 3,
              message: "La descripción debe tener al menos 3 caracteres",
            },
          })}
        />

        <Select
          label="Tipo de Alimento"
          options={foodTypeOptions}
          error={errors.foodType?.message}
          helperText={
            shouldAutoCategorize
              ? "Se categorizará automáticamente si se deja vacío"
              : undefined
          }
          {...register("foodType")}
        />

        <Input
          label="Cantidad (gramos)"
          type="number"
          step="1"
          min="1"
          placeholder="100"
          error={errors.quantity?.message}
          {...register("quantity", {
            required: "La cantidad es requerida",
            min: { value: 1, message: "La cantidad debe ser mayor a 0" },
            max: { value: 5000, message: "La cantidad parece ser muy alta" },
          })}
        />

        <Input
          label="Notas (opcional)"
          placeholder="Agregar notas sobre la comida..."
          {...register("notes")}
        />

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!isValid || isLoading}
          >
            Guardar Alimento
          </Button>
        </div>
      </form>
    </Card>
  );
};
