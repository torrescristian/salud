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
      className="flex flex-col items-center space-y-1 h-20"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </Button>
  );
}
