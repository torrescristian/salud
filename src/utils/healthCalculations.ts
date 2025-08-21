// Determinar estado de glucemia según límites personalizados
export function calculateGlucoseStatus(
  value: number,
  limits: { min: number; max: number }
): "normal" | "warning" | "critical" {
  if (value >= limits.min && value <= limits.max) {
    return "normal"; // Verde
  } else if (
    (value >= limits.min * 0.9 && value < limits.min) ||
    (value > limits.max && value <= limits.max * 1.2)
  ) {
    return "warning"; // Amarillo
  } else {
    return "critical"; // Rojo
  }
}

// Determinar estado de presión según límites personalizados
export function calculatePressureStatus(
  systolic: number,
  diastolic: number,
  limits: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
  }
): "normal" | "warning" | "critical" {
  const systolicStatus = calculateGlucoseStatus(systolic, limits.systolic);
  const diastolicStatus = calculateGlucoseStatus(diastolic, limits.diastolic);

  if (systolicStatus === "critical" || diastolicStatus === "critical") {
    return "critical";
  } else if (systolicStatus === "warning" || diastolicStatus === "warning") {
    return "warning";
  } else {
    return "normal";
  }
}

// Generar ID único
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Formatear fecha para mostrar
export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Formatear hora para mostrar
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Obtener fecha actual en formato YYYY-MM-DD
export function getCurrentDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Obtener hora actual en formato HH:MM
export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
