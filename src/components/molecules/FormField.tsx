import { ReactNode } from "react";
import { Label } from "../atoms/Label";
import { Input, InputProps } from "../atoms/Input";

export interface FormFieldProps extends Omit<InputProps, "id"> {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  children?: ReactNode; // Para componentes personalizados en lugar de Input
}

export function FormField({
  label,
  id,
  error,
  helpText,
  children,
  required,
  className = "",
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      {children || (
        <Input
          id={id}
          required={required}
          className="w-full px-3 py-2"
          {...inputProps}
        />
      )}

      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
