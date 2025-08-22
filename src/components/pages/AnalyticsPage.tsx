import { AnalyticsView } from "../organisms/AnalyticsView";
import {
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../../types/health";

interface AnalyticsPageProps {
  glucoseMeasurements: GlucoseMeasurement[];
  pressureMeasurements: PressureMeasurement[];
  insulinEntries: InsulinEntry[];
}

export const AnalyticsPage = ({
  glucoseMeasurements,
  pressureMeasurements,
  insulinEntries,
}: AnalyticsPageProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Análisis y Estadísticas
        </h2>
        <p className="text-gray-600">Visualiza el progreso de tu salud</p>
      </div>

      <AnalyticsView
        glucoseMeasurements={glucoseMeasurements}
        pressureMeasurements={pressureMeasurements}
        insulinEntries={insulinEntries}
      />
    </div>
  );
};
