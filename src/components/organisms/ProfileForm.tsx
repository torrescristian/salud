import { useState } from "react";
import { UserProfile } from "../../types/health";
import { Button } from "../atoms/Button";
import { FormField } from "../molecules/FormField";
import { StackPage } from "./StackPage";

export interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  onCancel: () => void;
  currentProfile?: UserProfile;
}

export function ProfileForm({
  onSubmit,
  onCancel,
  currentProfile,
}: ProfileFormProps) {
  const [name, setName] = useState(currentProfile?.name || "");
  const [glucoseMin, setGlucoseMin] = useState(
    currentProfile?.criticalGlucose?.min?.toString() || "70"
  );
  const [glucoseMax, setGlucoseMax] = useState(
    currentProfile?.criticalGlucose?.max?.toString() || "100"
  );
  const [systolicMin, setSystolicMin] = useState(
    currentProfile?.criticalPressure?.systolic?.min?.toString() || "110"
  );
  const [systolicMax, setSystolicMax] = useState(
    currentProfile?.criticalPressure?.systolic?.max?.toString() || "120"
  );
  const [diastolicMin, setDiastolicMin] = useState(
    currentProfile?.criticalPressure?.diastolic?.min?.toString() || "70"
  );
  const [diastolicMax, setDiastolicMax] = useState(
    currentProfile?.criticalPressure?.diastolic?.max?.toString() || "80"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: currentProfile?.id || "default",
      name,
      criticalGlucose: {
        min: parseFloat(glucoseMin),
        max: parseFloat(glucoseMax),
      },
      criticalPressure: {
        systolic: {
          min: parseFloat(systolicMin),
          max: parseFloat(systolicMax),
        },
        diastolic: {
          min: parseFloat(diastolicMin),
          max: parseFloat(diastolicMax),
        },
      },
    });
  };

  return (
    <StackPage
      title={currentProfile ? "Editar Perfil" : "Configurar Perfil"}
      onBack={onCancel}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="profile-name"
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Límites de Glucemia (mg/dL)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="glucose-min"
              label="Mínimo"
              type="number"
              value={glucoseMin}
              onChange={(e) => setGlucoseMin(e.target.value)}
              required
            />
            <FormField
              id="glucose-max"
              label="Máximo"
              type="number"
              value={glucoseMax}
              onChange={(e) => setGlucoseMax(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Límites de Presión Sistólica (mmHg)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="systolic-min"
              label="Mínimo"
              type="number"
              value={systolicMin}
              onChange={(e) => setSystolicMin(e.target.value)}
              required
            />
            <FormField
              id="systolic-max"
              label="Máximo"
              type="number"
              value={systolicMax}
              onChange={(e) => setSystolicMax(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Límites de Presión Diastólica (mmHg)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="diastolic-min"
              label="Mínimo"
              type="number"
              value={diastolicMin}
              onChange={(e) => setDiastolicMin(e.target.value)}
              required
            />
            <FormField
              id="diastolic-max"
              label="Máximo"
              type="number"
              value={diastolicMax}
              onChange={(e) => setDiastolicMax(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Guardar
          </Button>
        </div>
      </form>
    </StackPage>
  );
}
