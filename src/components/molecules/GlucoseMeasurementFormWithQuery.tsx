import React from "react";
import { useForm } from "react-hook-form";
import { Input, Select, Button, Card } from "../atoms";
import { useCreateGlucoseMeasurement } from "@/hooks";

export interface GlucoseMeasurementFormData {
  value: number;
  context: "fasting" | "postPrandial" | "custom";
  notes?: string;
}

export interface GlucoseMeasurementFormWithQueryProps {
  userId: string;
  onSuccess?: (measurement: any) => void;
  onCancel?: () => void;
  initialData?: Partial<GlucoseMeasurementFormData>;
}

const contextOptions = [
  { value: "fasting", label: "En ayunas" },
  { value: "postPrandial", label: "Postprandial" },
  { value: "custom", label: "Personalizado" },
];

export const GlucoseMeasurementFormWithQuery: React.FC<GlucoseMeasurementFormWithQueryProps> = ({
  userId,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const createMutation = useCreateGlucoseMeasurement();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<GlucoseMeasurementFormData>({
    defaultValues: initialData,
    mode: "onBlur",
  });

  const handleFormSubmit = async (data: GlucoseMeasurementFormData) => {
    try {
      const measurementData = {
        userId,
        value: Number(data.value),
        context: data.context,
        notes: data.notes,
      };

      const newMeasurement = await createMutation.mutateAsync(measurementData);
      
      reset();
      onSuccess?.(newMeasurement);
    } catch (error) {
      console.error("Error creating glucose measurement:", error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Nueva Medición de Glucosa
        </h3>

        {createMutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al guardar la medición. Por favor, intenta nuevamente.
          </div>
        )}

        <Input
          label="Valor de Glucosa (mg/dL)"
          type="number"
          step="0.1"
          min="0"
          error={errors.value?.message}
          {...register("value", {
            required: "El valor de glucosa es requerido",
            min: { value: 0, message: "El valor debe ser positivo" },
            max: { value: 1000, message: "El valor parece ser muy alto" },
          })}
        />

        <Select
          label="Contexto de la Medición"
          options={contextOptions}
          error={errors.context?.message}
          {...register("context", {
            required: "El contexto es requerido",
          })}
        />

        <Input
          label="Notas (opcional)"
          placeholder="Agregar notas sobre la medición..."
          {...register("notes")}
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
            Guardar Medición
          </Button>
        </div>
      </form>
    </Card>
  );
};
