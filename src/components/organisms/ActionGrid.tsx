import { ActionButton } from "../molecules/ActionButton";

export interface ActionGridProps {
  onMedicationClick: () => void;
  onGlucoseClick: () => void;
  onPressureClick: () => void;
  onInsulinClick: () => void;
}

export function ActionGrid({
  onMedicationClick,
  onGlucoseClick,
  onPressureClick,
  onInsulinClick,
}: ActionGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <ActionButton
        icon="💊"
        label="Medicación"
        onClick={onMedicationClick}
        variant="primary"
      />

      <ActionButton
        icon="📊"
        label="Glucemia"
        onClick={onGlucoseClick}
        variant="success"
      />

      <ActionButton
        icon="❤️"
        label="Presión"
        onClick={onPressureClick}
        variant="danger"
      />

      <ActionButton
        icon="💉"
        label="Insulina"
        onClick={onInsulinClick}
        variant="info"
      />
    </div>
  );
}
