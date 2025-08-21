import { useState } from "react";
import { Input } from "../atoms/Input";

export interface DateTimeFieldProps {
  label?: string;
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimeField({
  label = "Usar fecha personalizada",
  value,
  onChange,
  disabled = false,
  className = "",
}: DateTimeFieldProps) {
  const [useCustomDate, setUseCustomDate] = useState(!!value);

  const handleCheckboxChange = (checked: boolean) => {
    setUseCustomDate(checked);
    if (!checked) {
      onChange(undefined);
    } else {
      onChange(new Date());
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange(newDate);
  };

  return (
    <div className={className}>
      <label className="flex items-center space-x-2 mb-3">
        <input
          type="checkbox"
          checked={useCustomDate}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>

      {useCustomDate && (
        <Input
          type="datetime-local"
          value={value ? value.toISOString().slice(0, 16) : ""}
          onChange={handleDateChange}
          disabled={disabled}
          className="w-full px-3 py-2"
        />
      )}
    </div>
  );
}
