import { forwardRef } from "react";

export interface InputProps {
  type?: "text" | "number" | "email" | "password" | "datetime-local" | "date";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  min?: string;
  max?: string;
  step?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      value,
      onChange,
      placeholder,
      disabled = false,
      required = false,
      className = "",
      id,
      min,
      max,
      step,
    },
    ref
  ) => {
    const baseClasses =
      "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${baseClasses} ${disabledClasses} ${className}`}
        id={id}
        min={min}
        max={max}
        step={step}
      />
    );
  }
);

Input.displayName = "Input";
