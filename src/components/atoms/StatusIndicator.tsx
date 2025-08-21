export interface StatusIndicatorProps {
  status: "normal" | "warning" | "critical";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  normal: {
    color: "text-green-600",
    emoji: "🟢",
    text: "Normal",
  },
  warning: {
    color: "text-yellow-600",
    emoji: "🟡",
    text: "Atención",
  },
  critical: {
    color: "text-red-600",
    emoji: "🔴",
    text: "Crítico",
  },
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function StatusIndicator({
  status,
  showText = false,
  size = "md",
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`${config.color} ${sizeClasses[size]} font-medium flex items-center space-x-1`}
    >
      <span>{config.emoji}</span>
      {showText && <span>{config.text}</span>}
    </span>
  );
}
