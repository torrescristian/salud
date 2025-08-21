import React, { useState } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '../atoms';
import { FoodEntryFormWithQuery, FoodEntriesList } from '../molecules';
import { useWeeklyNutritionalTrends, useNutritionalAnalysis } from '@/hooks';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const NutritionManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  
  // En una aplicación real, este userId vendría del contexto de autenticación
  const userId = "demo-user-1";
  
  // Fechas para el análisis (últimos 7 días)
  const endDate = new Date();
  const startDate = subDays(endDate, 7);

  // Hooks de React Query
  const { data: weeklyTrends, isLoading: trendsLoading } = useWeeklyNutritionalTrends(userId, endDate);
  const { data: nutritionalAnalysis, isLoading: analysisLoading } = useNutritionalAnalysis(userId, startDate, endDate);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const isLoading = trendsLoading || analysisLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Nutrición
          </h2>
          <p className="text-gray-600">
            Registra y monitorea tu alimentación diaria
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
          disabled={showForm}
        >
          {showForm ? "Cancelar" : "Nueva Entrada"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <FoodEntryFormWithQuery
          userId={userId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialData={editingEntry ? {
            foodType: editingEntry.foodType,
            description: editingEntry.description,
            quantity: editingEntry.quantity,
            emoji: editingEntry.emoji,
            notes: editingEntry.notes,
          } : undefined}
        />
      )}

      {/* Nutritional Summary */}
      {nutritionalAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {nutritionalAnalysis.totalEntries}
              </div>
              <div className="text-sm text-gray-600">Total Entradas</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {nutritionalAnalysis.totalCalories}
              </div>
              <div className="text-sm text-gray-600">Total Calorías</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(nutritionalAnalysis.caloriesByType).length}
              </div>
              <div className="text-sm text-gray-600">Tipos de Comida</div>
            </div>
          </Card>
        </div>
      )}

      {/* Weekly Trends */}
      {weeklyTrends && (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tendencias de la Semana
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Consumo por Tipo</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Más consumido:</span>
                  <Badge variant="primary" size="sm">
                    {weeklyTrends.mostConsumedType}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Menos consumido:</span>
                  <Badge variant="secondary" size="sm">
                    {weeklyTrends.leastConsumedType}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Estadísticas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Promedio diario:</span>
                  <span className="font-medium">
                    {weeklyTrends.averageCaloriesPerDay.toFixed(0)} cal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Días registrados:</span>
                  <span className="font-medium">{weeklyTrends.totalDays}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Analizando nutrición...</span>
          </div>
        </Card>
      )}

      {/* Food Entries List */}
      <FoodEntriesList userId={userId} onEdit={handleEdit} />
    </div>
  );
};
