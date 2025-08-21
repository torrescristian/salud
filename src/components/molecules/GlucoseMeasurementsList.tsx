import React from "react";
import { useGlucoseMeasurements, useDeleteGlucoseMeasurement } from "@/hooks";
import { Button, Card } from "../atoms";
import { GlucoseMeasurement } from "@/domain/GlucoseMeasurement";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface GlucoseMeasurementsListProps {
  userId: string;
  onEdit?: (measurement: GlucoseMeasurement) => void;
}

export const GlucoseMeasurementsList: React.FC<GlucoseMeasurementsListProps> = ({
  userId,
  onEdit,
}) => {
  const { data: measurements, isLoading, error } = useGlucoseMeasurements(userId);
  const deleteMutation = useDeleteGlucoseMeasurement();

  const handleDelete = async (measurementId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta medición?")) {
      try {
        await deleteMutation.mutateAsync(measurementId);
      } catch (error) {
        console.error("Error deleting measurement:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "warning":
        return "Atención";
      case "critical":
        return "Crítico";
      default:
        return "Desconocido";
    }
  };

  const getContextLabel = (context: string) => {
    switch (context) {
      case "fasting":
        return "En ayunas";
      case "postPrandial":
        return "Postprandial";
      case "custom":
        return "Personalizado";
      default:
        return context;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            Error al cargar las mediciones
          </div>
          <p className="text-gray-500 text-sm">
            Por favor, intenta nuevamente más tarde
          </p>
        </div>
      </Card>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            No hay mediciones de glucosa registradas
          </div>
          <p className="text-gray-400 text-sm">
            Agrega tu primera medición para comenzar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Mediciones de Glucosa ({measurements.length})
        </h3>
        
        <div className="space-y-3">
          {measurements.map((measurement) => (
            <div
              key={measurement.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {measurement.value} mg/dL
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        measurement.status
                      )}`}
                    >
                      {getStatusLabel(measurement.status)}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-600">
                    <span>{getContextLabel(measurement.context)}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {format(measurement.timestamp, "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </span>
                  </div>
                  
                  {measurement.notes && (
                    <div className="mt-1 text-sm text-gray-500">
                      {measurement.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(measurement)}
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(measurement.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deleteMutation.isPending ? "..." : "Eliminar"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
