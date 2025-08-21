import React, { useState } from "react";
import { Card } from "../atoms";
import { GlucoseMeasurementFormWithQuery, GlucoseMeasurementsList } from "../molecules";
import { 
  useUserProfile, 
  useGlucoseMeasurements, 
  usePressureMeasurements, 
  useFoodEntries,
  useHealthSummary,
  useTrendsAnalysis 
} from "@/hooks";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

export const HealthDashboardWithQuery: React.FC = () => {
  const [showGlucoseForm, setShowGlucoseForm] = useState(false);
  
  // En una aplicación real, este userId vendría del contexto de autenticación
  const userId = "demo-user-1";
  
  // Fechas para el análisis (últimos 30 días)
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  // Hooks de React Query
  const { data: userProfile, isLoading: userLoading } = useUserProfile(userId);
  const { data: glucoseMeasurements, isLoading: glucoseLoading } = useGlucoseMeasurements(userId);
  const { data: pressureMeasurements, isLoading: pressureLoading } = usePressureMeasurements(userId);
  const { data: foodEntries, isLoading: foodLoading } = useFoodEntries(userId);
  const { data: healthSummary, isLoading: summaryLoading } = useHealthSummary(userId, startDate, endDate);
  const { data: trendsAnalysis, isLoading: trendsLoading } = useTrendsAnalysis(userId, startDate, endDate);

  const handleGlucoseFormSuccess = () => {
    setShowGlucoseForm(false);
  };

  const handleGlucoseFormCancel = () => {
    setShowGlucoseForm(false);
  };

  const isLoading = userLoading || glucoseLoading || pressureLoading || foodLoading || summaryLoading || trendsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={`skeleton-${i}`} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Salud
          </h1>
          {userProfile && (
            <p className="mt-2 text-gray-600">
              Bienvenido, {userProfile.name} • Última actualización: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
            </p>
          )}
        </div>

        {/* Health Summary Cards */}
        {healthSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {healthSummary.overallHealthScore}/100
                </div>
                <div className="text-sm text-gray-600">Puntuación General</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {healthSummary.glucoseSummary.totalMeasurements}
                </div>
                <div className="text-sm text-gray-600">Mediciones Glucosa</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {healthSummary.pressureSummary.totalMeasurements}
                </div>
                <div className="text-sm text-gray-600">Mediciones Presión</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {healthSummary.nutritionalSummary.totalEntries}
                </div>
                <div className="text-sm text-gray-600">Entradas Comida</div>
              </div>
            </Card>
          </div>
        )}

        {/* Alerts */}
        {healthSummary?.alerts && healthSummary.alerts.length > 0 && (
          <div className="mb-8">
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas de Salud</h3>
              <div className="space-y-2">
                {healthSummary.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                        : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowGlucoseForm(!showGlucoseForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showGlucoseForm ? "Cancelar" : "Nueva Medición Glucosa"}
            </button>
          </div>
        </div>

        {/* Glucose Form */}
        {showGlucoseForm && (
          <div className="mb-8">
            <GlucoseMeasurementFormWithQuery
              userId={userId}
              onSuccess={handleGlucoseFormSuccess}
              onCancel={handleGlucoseFormCancel}
            />
          </div>
        )}

        {/* Recent Measurements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Glucose Measurements */}
          <div>
            <GlucoseMeasurementsList userId={userId} />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {trendsAnalysis && (
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Análisis de Tendencias</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendencia Glucosa:</span>
                    <span className="font-medium">
                      {trendsAnalysis.glucoseTrend.direction === 'increasing' ? '↗️ Aumentando' : 
                       trendsAnalysis.glucoseTrend.direction === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendencia Presión:</span>
                    <span className="font-medium">
                      {trendsAnalysis.pressureTrend.direction === 'increasing' ? '↗️ Aumentando' : 
                       trendsAnalysis.pressureTrend.direction === 'decreasing' ? '↘️ Disminuyendo' : '→ Estable'}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {healthSummary && (
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recomendaciones</h3>
                <div className="space-y-2">
                  {healthSummary.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {rec}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
