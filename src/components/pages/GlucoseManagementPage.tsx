import React, { useState } from "react";
import { GlucoseMeasurementFormWithQuery, GlucoseMeasurementsList } from "../molecules";
import { Button } from "../atoms";
import { GlucoseMeasurement } from "@/domain/GlucoseMeasurement";

export const GlucoseManagementPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<GlucoseMeasurement | null>(null);
  
  // En una aplicación real, este userId vendría del contexto de autenticación
  const userId = "demo-user-1";

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMeasurement(null);
  };

  const handleEdit = (measurement: GlucoseMeasurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMeasurement(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Control de Glucosa
          </h1>
          <p className="mt-2 text-gray-600">
            Registra y monitorea tus niveles de glucosa en sangre
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="primary"
            disabled={showForm}
          >
            {showForm ? "Cancelar" : "Nueva Medición"}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <GlucoseMeasurementFormWithQuery
              userId={userId}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
              initialData={editingMeasurement ? {
                value: editingMeasurement.value,
                context: editingMeasurement.context,
                notes: editingMeasurement.notes,
              } : undefined}
            />
          </div>
        )}

        {/* Measurements List */}
        <GlucoseMeasurementsList
          userId={userId}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};
