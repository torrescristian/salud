import { Button } from "../atoms/Button";

export interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  disabled?: boolean;
}

export function ActionButton({
  icon,
  label,
  onClick,
  variant = "primary",
  disabled = false,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size="lg"
      disabled={disabled}
      className="flex flex-col items-center justify-center space-y-3 h-24 bg-gradient-to-br hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-0"
    >
      <div className="text-3xl filter drop-shadow-sm">{icon}</div>
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </Button>
  );
}
