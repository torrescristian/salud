import { Button } from "../atoms/Button";
import { formatDate } from "../../utils/healthCalculations";

export interface AppHeaderProps {
  onProfileClick: () => void;
}

export function AppHeader({ onProfileClick }: AppHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Control Médico</h1>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {formatDate(new Date())}
            </span>

            <Button
              onClick={onProfileClick}
              variant="secondary"
              size="sm"
              className="text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 border-none"
            >
              Perfil
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
