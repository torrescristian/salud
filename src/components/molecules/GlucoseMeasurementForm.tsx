import React from "react";
import { useForm } from "react-hook-form";
import { Input, Select, Button, Card } from "../atoms";

export interface GlucoseMeasurementFormData {
  value: number;
  context: "fasting" | "postPrandial" | "custom";
  notes?: string;
}

export interface GlucoseMeasurementFormProps {
  onSubmit: (data: GlucoseMeasurementFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<GlucoseMeasurementFormData>;
}

const contextOptions = [
  { value: "fasting", label: "En ayunas" },
  { value: "postPrandial", label: "Postprandial" },
  { value: "custom", label: "Personalizado" },
];

export const GlucoseMeasurementForm: React.FC<GlucoseMeasurementFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm<GlucoseMeasurementFormData>({
    defaultValues: initialData,
    mode: "onSubmit",
  });

  const handleFormSubmit = (data: GlucoseMeasurementFormData) => {
    // Convertir el valor a number ya que los inputs HTML siempre devuelven strings
    const formData = {
      ...data,
      value: Number(data.value),
    };
    onSubmit(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Nueva Medición de Glucosa
        </h3>

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
            Guardar Medición
          </Button>
        </div>
      </form>
    </Card>
  );
};
