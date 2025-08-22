import { Button } from "../atoms/Button";

export interface AppHeaderProps {
  onProfileClick: () => void;
  userProfile?: {
    name: string;
    criticalGlucose: { min: number; max: number };
    criticalPressure: {
      systolic: { min: number; max: number };
      diastolic: { min: number; max: number };
    };
  };
}

export function AppHeader({ onProfileClick, userProfile }: AppHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Header Principal */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo y Título */}
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Control Médico
              </h1>
              <p className="text-blue-100 text-xs">Tu salud, tu control</p>
            </div>
          </div>

          {/* Acciones del Usuario */}
          <div className="flex items-center space-x-3">
            {/* Indicador de Usuario */}
            {userProfile && (
              <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium">{userProfile.name}</p>
                  <p className="text-xs text-blue-100">Usuario Activo</p>
                </div>
              </div>
            )}

            {/* Botón de Perfil */}
            <Button
              onClick={onProfileClick}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm px-3 py-1"
            >
              <span className="mr-1">👤</span>
              Perfil
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
