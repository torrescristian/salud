import { useState } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface DateSelectorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

export function DateSelector({
  currentDate,
  onDateChange,
  className = "",
}: DateSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Crear la fecha inicial sin conversión de zona horaria
  const getInitialDateTime = () => {
    if (currentDate.includes("T")) {
      return currentDate;
    }
    // Si solo tenemos fecha, usar la hora actual local
    const now = new Date();
    const localTimeString = now.toLocaleTimeString("sv-SE", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${currentDate}T${localTimeString}`;
  };

  const [selectedDateTime, setSelectedDateTime] = useState(
    getInitialDateTime()
  );

  const currentDateObj = parseISO(currentDate);
  const today = new Date();
  const isToday = isSameDay(currentDateObj, today);

  const goToPreviousDay = () => {
    const prevDay = subDays(currentDateObj, 1);
    const prevDayString = prevDay.toISOString().split("T")[0];
    onDateChange(prevDayString);
  };

  const goToNextDay = () => {
    const nextDay = addDays(currentDateObj, 1);
    const nextDayString = nextDay.toISOString().split("T")[0];
    onDateChange(nextDayString);
  };

  const goToToday = () => {
    const todayString = today.toISOString().split("T")[0];
    onDateChange(todayString);
  };

  const handleCustomDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedDateTime(e.target.value);
  };

  const applyCustomDateTime = () => {
    // Extraer solo la fecha sin conversión de zona horaria
    const dateOnly = selectedDateTime.split("T")[0];
    onDateChange(dateOnly);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Navegación de Fechas */}
      <div className="flex items-center space-x-1">
        <Button
          onClick={goToPreviousDay}
          variant="secondary"
          size="sm"
          className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
        >
          ←
        </Button>

        <Button
          onClick={goToToday}
          variant="secondary"
          size="sm"
          className={`px-2 py-1 text-xs ${
            isToday
              ? "bg-white text-blue-700 font-semibold"
              : "bg-white/20 hover:bg-white/30 text-white"
          }`}
        >
          Hoy
        </Button>

        <Button
          onClick={goToNextDay}
          variant="secondary"
          size="sm"
          className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
        >
          →
        </Button>
      </div>

      {/* Fecha Actual */}
      <div className="text-center min-w-[140px]">
        <p className="text-sm font-semibold text-white">
          {formatDisplayDate(currentDate)}
        </p>
      </div>

      {/* Selector de Fecha Personalizada */}
      <div className="relative">
        <Button
          onClick={() => setShowDatePicker(!showDatePicker)}
          variant="secondary"
          size="sm"
          className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
        >
          📅
        </Button>

        {showDatePicker && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 min-w-[300px]">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Seleccionar Fecha y Hora
              </h3>

              <Input
                type="datetime-local"
                value={selectedDateTime}
                onChange={handleCustomDateTimeChange}
                className="w-full"
              />

              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowDatePicker(false)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={applyCustomDateTime}
                  size="sm"
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
