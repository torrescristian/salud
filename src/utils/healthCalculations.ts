import { parseISO } from "date-fns";
import { utcDate } from "./dateUtils";

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
  // Usar fecha local en lugar de UTC para evitar problemas de zona horaria
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

// Obtener fecha actual como objeto Date en zona horaria local
export function getCurrentDateLocal(): Date {
  const now = new Date();
  // Crear una nueva fecha usando solo año, mes y día para evitar problemas de zona horaria
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Crear fecha en zona horaria local (para evitar problemas UTC)
export function createLocalDate(date?: Date | string): Date {
  if (date) {
    if (typeof date === "string") {
      // Para strings YYYY-MM-DD, crear fecha explícitamente en zona local
      if (date.includes("-") && date.length === 10) {
        // Formato YYYY-MM-DD - crear fecha en zona local para evitar UTC
        const [year, month, day] = date.split("-").map(Number);
        // month es 0-indexed en JavaScript Date
        return new Date(year, month - 1, day);
      } else {
        // Otros formatos, usar parseISO si es posible
        try {
          return parseISO(date);
        } catch {
          // Fallback a Date constructor si parseISO falla
          const tempDate = new Date(date);
          return new Date(
            tempDate.getFullYear(),
            tempDate.getMonth(),
            tempDate.getDate(),
            tempDate.getHours(),
            tempDate.getMinutes(),
            tempDate.getSeconds()
          );
        }
      }
    } else {
      // Si se pasa una fecha objeto, asegurarse de que esté en zona horaria local
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );
    }
  }
  // Si no se pasa fecha, usar la fecha actual en zona horaria local
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );
}

// Convertir fecha a string ISO en zona local (para guardar sin conversión UTC)
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Retornar como YYYY-MM-DDTHH:mm:ss (sin Z para evitar UTC)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Migrar timestamps UTC existentes a zona local
export function migrateUTCToLocal(timestampString: string): Date {
  console.log("🚀 migrateUTCToLocal LLAMADA CON:", timestampString);
  try {
    // Validar que el string no esté vacío
    if (!timestampString || typeof timestampString !== "string") {
      console.warn("migrateUTCToLocal: timestamp inválido:", timestampString);
      return new Date(); // Fallback a fecha actual
    }

    // Si el timestamp tiene 'Z' al final, es UTC y necesita corrección
    if (timestampString.includes("Z")) {
      // Usar la utilidad de dateUtils para conversión UTC a local
      const localDate = utcDate(timestampString);

      // Debug: agregar logs para entender qué está pasando
      const originalUtcDate = new Date(timestampString);
      console.log("🔧 migrateUTCToLocal EJECUTANDOSE:", {
        input: timestampString,
        utcDate: originalUtcDate.toString(),
        utcISO: originalUtcDate.toISOString(),
        localDate: localDate.toString(),
        localISO: localDate.toISOString(),
        dateKey: `${localDate.getFullYear()}-${String(
          localDate.getMonth() + 1
        ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`,
      });

      return localDate;
    } else {
      // Si no tiene 'Z', asumimos que ya está en formato local
      const localDate = createLocalDate(timestampString);

      // Validar que la fecha sea válida
      if (isNaN(localDate.getTime())) {
        console.warn(
          "migrateUTCToLocal: fecha local inválida:",
          timestampString
        );
        return new Date(); // Fallback a fecha actual
      }

      return localDate;
    }
  } catch (error) {
    console.error(
      "migrateUTCToLocal: error procesando timestamp:",
      timestampString,
      error
    );
    return new Date(); // Fallback a fecha actual
  }
}

// Obtener hora actual en formato HH:MM
export function getCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
