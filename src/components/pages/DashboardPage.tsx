import React, { useState } from "react";
import { MainLayout } from "../templates";
import { HealthDashboard } from "../organisms";
import { GlucoseMeasurementForm, FoodEntryForm } from "../molecules";
import { Button } from "../atoms";
import { GlucoseMeasurement, PressureMeasurement, FoodEntry } from "@/domain";
import { MobileNavigation, DesktopNavigation } from "../molecules";

export const DashboardPage: React.FC = () => {
  const [showGlucoseForm, setShowGlucoseForm] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);

  // Mock data - en una implementación real esto vendría de react-query
  const [glucoseMeasurements, setGlucoseMeasurements] = useState<
    GlucoseMeasurement[]
  >([]);
  const [pressureMeasurements] = useState<PressureMeasurement[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);

  const handleAddGlucoseMeasurement = (data: any) => {
    // En una implementación real, esto se enviaría al backend
    const newMeasurement = new GlucoseMeasurement({
      id: Math.random().toString(36).substr(2, 9),
      userId: "user1",
      value: data.value,
      context: data.context,
      status: "normal", // Se calcularía basándose en los límites del usuario
    });

    setGlucoseMeasurements((prev) => [newMeasurement, ...prev]);
    setShowGlucoseForm(false);
  };

  const handleAddFoodEntry = (data: any) => {
    // En una implementación real, esto se enviaría al backend
    const newEntry = new FoodEntry({
      id: Math.random().toString(36).substr(2, 9),
      userId: "user1",
      description: data.description,
      quantity: data.quantity,
      foodType: data.foodType,
    });

    setFoodEntries((prev) => [newEntry, ...prev]);
    setShowFoodForm(false);
  };

  const handleAddPressureMeasurement = () => {
    // TODO: Implementar formulario de presión arterial
    console.log("Agregar medición de presión arterial");
  };

  const handleViewAllMeasurements = () => {
    // Navegar a la página de todas las mediciones
    console.log("Navegar a todas las mediciones");
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', isActive: true },
    { id: 'measurements', label: 'Mediciones', icon: '📏', href: '/measurements' },
    { id: 'nutrition', label: 'Nutrición', icon: '🍎', href: '/nutrition' },
    { id: 'reports', label: 'Reportes', icon: '📈', href: '/reports' },
    { id: 'settings', label: 'Configuración', icon: '⚙️', href: '/settings' },
  ];

  const handleNavigate = (href: string) => {
    console.log('Navegar a:', href);
    // TODO: Implementar navegación real
  };

  const header = (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        <MobileNavigation items={navigationItems} onNavigate={handleNavigate} />
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Control Médico</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="hidden sm:inline text-sm text-gray-600">Usuario: Juan Pérez</span>
        <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Navegación
        </h3>
        <DesktopNavigation items={navigationItems} onNavigate={handleNavigate} />
      </div>
    </div>
  );

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6">
        {/* Forms Modals */}
        {showGlucoseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Nueva Medición de Glucosa
                  </h2>
                  <button
                    onClick={() => setShowGlucoseForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <GlucoseMeasurementForm
                  onSubmit={handleAddGlucoseMeasurement}
                  onCancel={() => setShowGlucoseForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {showFoodForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Nueva Entrada de Alimento
                  </h2>
                  <button
                    onClick={() => setShowFoodForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <FoodEntryForm
                  onSubmit={handleAddFoodEntry}
                  onCancel={() => setShowFoodForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        <HealthDashboard
          glucoseMeasurements={glucoseMeasurements}
          pressureMeasurements={pressureMeasurements}
          foodEntries={foodEntries}
          onAddGlucoseMeasurement={() => setShowGlucoseForm(true)}
          onAddPressureMeasurement={handleAddPressureMeasurement}
          onAddFoodEntry={() => setShowFoodForm(true)}
          onViewAllMeasurements={handleViewAllMeasurements}
        />
      </div>
    </MainLayout>
  );
};
