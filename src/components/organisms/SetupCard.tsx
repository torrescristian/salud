import { Button } from "../atoms/Button";

export interface SetupCardProps {
  onSetupClick: () => void;
}

export function SetupCard({ onSetupClick }: SetupCardProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Configuración Inicial
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Para comenzar, necesitamos configurar algunos datos básicos de tu
          perfil de salud.
        </p>

        <Button onClick={onSetupClick} size="lg" className="w-full">
          Configurar Perfil
        </Button>
      </div>
    </div>
  );
}
