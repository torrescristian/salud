import { ReactNode } from "react";

export interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function Label({
  children,
  htmlFor,
  required = false,
  className = "",
}: LabelProps) {
  const baseClasses = "block text-sm font-medium text-gray-700";

  return (
    <label htmlFor={htmlFor} className={`${baseClasses} ${className}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
