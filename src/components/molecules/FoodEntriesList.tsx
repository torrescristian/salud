import React from 'react';
import { useFoodEntries, useDeleteFoodEntry } from '@/hooks';
import { Card, Badge, Button, LoadingSpinner } from '../atoms';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface FoodEntriesListProps {
  userId: string;
  onEdit?: (entry: any) => void;
}

const getFoodTypeLabel = (type: string) => {
  const labels = {
    carbohydrates: 'Carbohidratos',
    proteins: 'Proteínas',
    vegetables: 'Verduras',
    eggs: 'Huevos',
    dairy: 'Lácteos',
  };
  return labels[type as keyof typeof labels] || type;
};

const getFoodTypeColor = (type: string) => {
  const colors = {
    carbohydrates: 'warning',
    proteins: 'primary',
    vegetables: 'success',
    eggs: 'info',
    dairy: 'secondary',
  };
  return colors[type as keyof typeof colors] || 'secondary';
};

export const FoodEntriesList: React.FC<FoodEntriesListProps> = ({
  userId,
  onEdit,
}) => {
  const { data: entries, isLoading, error } = useFoodEntries(userId);
  const deleteMutation = useDeleteFoodEntry();

  const handleDelete = async (entryId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta entrada?')) {
      try {
        await deleteMutation.mutateAsync(entryId);
      } catch (error) {
        console.error('Error deleting food entry:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando entradas de comida...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            Error al cargar las entradas de comida
          </div>
          <p className="text-gray-500 text-sm">
            Por favor, intenta nuevamente más tarde
          </p>
        </div>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            No hay entradas de comida registradas
          </div>
          <p className="text-gray-400 text-sm">
            Agrega tu primera entrada para comenzar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Entradas de Comida ({entries.length})
        </h3>
        
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{entry.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {entry.description}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getFoodTypeColor(entry.foodType) as any} size="sm">
                          {getFoodTypeLabel(entry.foodType)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {entry.quantity}g
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {format(entry.timestamp, 'dd/MM/yyyy HH:mm', {
                      locale: es,
                    })}
                  </div>
                  
                  {entry.notes && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      {entry.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(entry)}
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deleteMutation.isPending ? '...' : 'Eliminar'}
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
