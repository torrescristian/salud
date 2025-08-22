// Tipos base para el MVP de seguimiento de salud

export interface UserProfile {
  id: string;
  name: string;
  criticalGlucose: { min: number; max: number };
  criticalPressure: {
    systolic: { min: number; max: number };
    diastolic: { min: number; max: number };
  };
}

export interface UserMedication {
  id: string;
  name: string; // Nombre exacto como lo escribe el usuario
  withFood: "before" | "after" | "during" | "none";
  usageCount: number;
  lastUsed: Date;
}

export interface GlucoseMeasurement {
  id: string;
  userId: string;
  timestamp: Date;
  value: number;
  context: "fasting" | "postprandial" | "custom";
  status: "normal" | "warning" | "critical";
}

export interface PressureMeasurement {
  id: string;
  userId: string;
  timestamp: Date;
  systolic: number; // Presión alta (número superior)
  diastolic: number; // Presión baja (número inferior)
  status: "normal" | "warning" | "critical";
}

export interface InsulinEntry {
  id: string;
  userId: string;
  timestamp: Date;
  dose: number; // unidades
  type: "rapid" | "long" | "mixed";
  context: "fasting" | "postprandial" | "correction";
  notes?: string;
}

export interface DailyEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  entries: Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string; // HH:MM
    date: string; // YYYY-MM-DD
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }>;
}

export interface AppState {
  userProfile: UserProfile | null;
  dailyEntries: DailyEntry[];
  userMedications: UserMedication[];
  currentDate: string;
  measurements: {
    glucose: GlucoseMeasurement[];
    pressure: PressureMeasurement[];
    insulin: InsulinEntry[];
  };
}
