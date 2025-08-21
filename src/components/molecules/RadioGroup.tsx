export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  legend?: string;
  layout?: "vertical" | "horizontal" | "grid";
  className?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  legend,
  layout = "vertical",
  className = "",
}: RadioGroupProps) {
  const layoutClasses = {
    vertical: "space-y-2",
    horizontal: "flex space-x-4",
    grid: "grid grid-cols-2 gap-2",
  };

  return (
    <fieldset className={className}>
      {legend && (
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          {legend}
        </legend>
      )}

      <div className={layoutClasses[layout]}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start space-x-3 cursor-pointer"
            aria-label={`${legend ? `${legend}: ` : ""}${option.label}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {option.icon && <span>{option.icon}</span>}
                <span className="font-medium text-gray-900">
                  {option.label}
                </span>
              </div>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
