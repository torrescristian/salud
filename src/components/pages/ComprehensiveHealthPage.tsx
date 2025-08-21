import React, { useState } from 'react';
import { HealthDashboardWithQuery, NutritionManagement } from '../organisms';
import { Button, Badge, Modal } from '../atoms';
import { useUserProfile, useHealthSummary, useTrendsAnalysis } from '@/hooks';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const ComprehensiveHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'nutrition' | 'reports'>('dashboard');
  const [showReportModal, setShowReportModal] = useState(false);
  
  // En una aplicación real, este userId vendría del contexto de autenticación
  const userId = "demo-user-1";
  
  // Fechas para el análisis (últimos 30 días)
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  // Hooks de React Query
  const { data: userProfile, isLoading: userLoading } = useUserProfile(userId);
  const { data: healthSummary, isLoading: summaryLoading } = useHealthSummary(userId, startDate, endDate);
  const { data: trendsAnalysis, isLoading: trendsLoading } = useTrendsAnalysis(userId, startDate, endDate);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'nutrition', label: 'Nutrición', icon: '🍎' },
    { id: 'reports', label: 'Reportes', icon: '📋' },
  ];

  const isLoading = userLoading || summaryLoading || trendsLoading;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HealthDashboardWithQuery />;
      case 'nutrition':
        return <NutritionManagement />;
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Reportes de Salud
              </h3>
              <p className="text-gray-600 mb-4">
                Genera reportes detallados de tu salud
              </p>
              <Button
                onClick={() => setShowReportModal(true)}
                variant="primary"
              >
                Generar Reporte
              </Button>
            </div>
          </div>
        );
      default:
        return <HealthDashboardWithQuery />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Control Médico
              </h1>
              {userProfile && (
                <Badge variant="info" size="sm">
                  {userProfile.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {healthSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {healthSummary.overallHealthScore}/100
                </div>
                <div className="text-sm text-gray-600">Puntuación General</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {healthSummary.glucoseSummary.totalMeasurements}
                </div>
                <div className="text-sm text-gray-600">Mediciones Glucosa</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {healthSummary.pressureSummary.totalMeasurements}
                </div>
                <div className="text-sm text-gray-600">Mediciones Presión</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {healthSummary.nutritionalSummary.totalEntries}
                </div>
                <div className="text-sm text-gray-600">Entradas Comida</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando información de salud...</p>
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Generar Reporte de Salud"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Selecciona el tipo de reporte que deseas generar:
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <Button variant="secondary" className="justify-start">
              📊 Reporte General de Salud
            </Button>
            <Button variant="secondary" className="justify-start">
              🍎 Reporte Nutricional
            </Button>
            <Button variant="secondary" className="justify-start">
              📈 Análisis de Tendencias
            </Button>
            <Button variant="secondary" className="justify-start">
              📋 Reporte para Médico
            </Button>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowReportModal(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary">
              Generar Reporte
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
