import { userProfileRepository } from "../repositories/userProfileRepository";
import { medicationRepository } from "../repositories/medicationRepository";
import { glucoseRepository } from "../repositories/glucoseRepository";
import { pressureRepository } from "../repositories/pressureRepository";
import { insulinRepository } from "../repositories/insulinRepository";
import {
  UserProfile,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../types/health";
import { generateId } from "../utils/idGenerator";

export interface HealthService {
  // User Profile
  getUserProfile(): UserProfile | null;
  saveUserProfile(profile: UserProfile): void;

  // Medications
  getMedications(): UserMedication[];
  addMedication(
    name: string,
    withFood: "before" | "during" | "after" | "none",
    customDate?: Date
  ): UserMedication;
  updateMedication(id: string, updates: Partial<UserMedication>): void;
  deleteMedication(id: string): void;
  getMedicationSuggestions(
    query: string
  ): Array<{ name: string; usageCount: number }>;

  // Glucose Measurements
  getGlucoseMeasurements(): GlucoseMeasurement[];
  addGlucoseMeasurement(
    value: number,
    context: "fasting" | "postprandial" | "custom",
    customDate?: Date
  ): GlucoseMeasurement;
  updateGlucoseMeasurement(
    id: string,
    updates: Partial<GlucoseMeasurement>
  ): void;
  deleteGlucoseMeasurement(id: string): void;

  // Pressure Measurements
  getPressureMeasurements(): PressureMeasurement[];
  addPressureMeasurement(
    systolic: number,
    diastolic: number,
    customDate?: Date
  ): PressureMeasurement;
  updatePressureMeasurement(
    id: string,
    updates: Partial<PressureMeasurement>
  ): void;
  deletePressureMeasurement(id: string): void;

  // Insulin Entries
  getInsulinEntries(): InsulinEntry[];
  addInsulinEntry(
    dose: number,
    type: "rapid" | "long" | "mixed",
    context: "fasting" | "postprandial" | "correction",
    notes?: string,
    customDate?: Date
  ): InsulinEntry;
  updateInsulinEntry(id: string, updates: Partial<InsulinEntry>): void;
  deleteInsulinEntry(id: string): void;

  // Data Queries
  getTodayEntries(): Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }>;
  getEntriesByDate(date: Date): Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }>;
}

class HealthServiceImpl implements HealthService {
  // User Profile
  getUserProfile(): UserProfile | null {
    return userProfileRepository.getUserProfile();
  }

  saveUserProfile(profile: UserProfile): void {
    userProfileRepository.saveUserProfile(profile);
  }

  // Medications
  getMedications(): UserMedication[] {
    return medicationRepository.getMedications();
  }

  addMedication(
    name: string,
    withFood: "before" | "during" | "after" | "none",
    customDate?: Date
  ): UserMedication {
    const medication: UserMedication = {
      id: generateId(),
      name,
      withFood,
      usageCount: 1,
      lastUsed: customDate || new Date(),
    };

    medicationRepository.saveMedication(medication);
    return medication;
  }

  updateMedication(id: string, updates: Partial<UserMedication>): void {
    medicationRepository.updateMedication(id, updates);
  }

  deleteMedication(id: string): void {
    medicationRepository.deleteMedication(id);
  }

  getMedicationSuggestions(
    query: string
  ): Array<{ name: string; usageCount: number }> {
    const suggestions = medicationRepository.getMedicationSuggestions();

    if (!query.trim()) {
      return suggestions.slice(0, 5); // Top 5 más usados
    }

    return suggestions
      .filter((suggestion: { name: string; usageCount: number }) =>
        suggestion.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }

  // Glucose Measurements
  getGlucoseMeasurements(): GlucoseMeasurement[] {
    return glucoseRepository.getGlucoseMeasurements();
  }

  addGlucoseMeasurement(
    value: number,
    context: "fasting" | "postprandial" | "custom",
    customDate?: Date
  ): GlucoseMeasurement {
    const measurement: GlucoseMeasurement = {
      id: generateId(),
      userId: "default", // Por ahora usamos un ID por defecto
      value,
      context,
      timestamp: customDate || new Date(),
      status: this.calculateGlucoseStatus(value),
    };

    glucoseRepository.saveGlucoseMeasurement(measurement);
    return measurement;
  }

  updateGlucoseMeasurement(
    id: string,
    updates: Partial<GlucoseMeasurement>
  ): void {
    if (updates.value !== undefined) {
      updates.status = this.calculateGlucoseStatus(updates.value);
    }
    glucoseRepository.updateGlucoseMeasurement(id, updates);
  }

  deleteGlucoseMeasurement(id: string): void {
    glucoseRepository.deleteGlucoseMeasurement(id);
  }

  // Pressure Measurements
  getPressureMeasurements(): PressureMeasurement[] {
    return pressureRepository.getPressureMeasurements();
  }

  addPressureMeasurement(
    systolic: number,
    diastolic: number,
    customDate?: Date
  ): PressureMeasurement {
    const measurement: PressureMeasurement = {
      id: generateId(),
      userId: "default", // Por ahora usamos un ID por defecto
      systolic,
      diastolic,
      timestamp: customDate || new Date(),
      status: this.calculatePressureStatus(systolic, diastolic),
    };

    pressureRepository.savePressureMeasurement(measurement);
    return measurement;
  }

  updatePressureMeasurement(
    id: string,
    updates: Partial<PressureMeasurement>
  ): void {
    if (updates.systolic !== undefined || updates.diastolic !== undefined) {
      const current = pressureRepository
        .getPressureMeasurements()
        .find((m: PressureMeasurement) => m.id === id);
      if (current) {
        const systolic = updates.systolic ?? current.systolic;
        const diastolic = updates.diastolic ?? current.diastolic;
        updates.status = this.calculatePressureStatus(systolic, diastolic);
      }
    }
    pressureRepository.updatePressureMeasurement(id, updates);
  }

  deletePressureMeasurement(id: string): void {
    pressureRepository.deletePressureMeasurement(id);
  }

  // Insulin Entries
  getInsulinEntries(): InsulinEntry[] {
    return insulinRepository.getInsulinEntries();
  }

  addInsulinEntry(
    dose: number,
    type: "rapid" | "long" | "mixed",
    context: "fasting" | "postprandial" | "correction",
    notes?: string,
    customDate?: Date
  ): InsulinEntry {
    const entry: InsulinEntry = {
      id: generateId(),
      userId: "default", // Por ahora usamos un ID por defecto
      dose,
      type,
      context,
      notes,
      timestamp: customDate || new Date(),
    };

    insulinRepository.saveInsulinEntry(entry);
    return entry;
  }

  updateInsulinEntry(id: string, updates: Partial<InsulinEntry>): void {
    insulinRepository.updateInsulinEntry(id, updates);
  }

  deleteInsulinEntry(id: string): void {
    insulinRepository.deleteInsulinEntry(id);
  }

  // Data Queries
  getTodayEntries(): Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }> {
    const today = new Date();
    return this.getEntriesByDate(today);
  }

  getEntriesByDate(date: Date): Array<{
    type: "medication" | "glucose" | "pressure" | "insulin";
    time: string;
    data:
      | UserMedication
      | GlucoseMeasurement
      | PressureMeasurement
      | InsulinEntry;
  }> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const entries: Array<{
      type: "medication" | "glucose" | "pressure" | "insulin";
      time: string;
      data:
        | UserMedication
        | GlucoseMeasurement
        | PressureMeasurement
        | InsulinEntry;
    }> = [];

    // Agregar medicaciones
    const medications = this.getMedications().filter((med) => {
      const medDate = new Date(med.lastUsed);
      return medDate >= targetDate && medDate < nextDate;
    });

    medications.forEach((med) => {
      entries.push({
        type: "medication",
        time: med.lastUsed.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: med,
      });
    });

    // Agregar mediciones de glucosa
    const glucoseMeasurements = this.getGlucoseMeasurements().filter(
      (measurement) => {
        const measurementDate = new Date(measurement.timestamp);
        return measurementDate >= targetDate && measurementDate < nextDate;
      }
    );

    glucoseMeasurements.forEach((measurement) => {
      entries.push({
        type: "glucose",
        time: measurement.timestamp.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: measurement,
      });
    });

    // Agregar mediciones de presión
    const pressureMeasurements = this.getPressureMeasurements().filter(
      (measurement) => {
        const measurementDate = new Date(measurement.timestamp);
        return measurementDate >= targetDate && measurementDate < nextDate;
      }
    );

    pressureMeasurements.forEach((measurement) => {
      entries.push({
        type: "pressure",
        time: measurement.timestamp.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: measurement,
      });
    });

    // Agregar entradas de insulina
    const insulinEntries = this.getInsulinEntries().filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= targetDate && entryDate < nextDate;
    });

    insulinEntries.forEach((entry) => {
      entries.push({
        type: "insulin",
        time: entry.timestamp.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: entry,
      });
    });

    // Ordenar por timestamp
    return entries.sort((a, b) => {
      const timeA = new Date(
        "timestamp" in a.data ? a.data.timestamp : a.data.lastUsed
      );
      const timeB = new Date(
        "timestamp" in b.data ? b.data.timestamp : b.data.lastUsed
      );
      return timeB.getTime() - timeA.getTime();
    });
  }

  // Private helper methods
  private calculateGlucoseStatus(
    value: number
  ): "normal" | "warning" | "critical" {
    // Estos valores deberían venir del perfil del usuario
    const min = 70;
    const max = 180;

    if (value >= min && value <= max) {
      return "normal";
    } else if (
      (value >= min * 0.9 && value < min) ||
      (value > max && value <= max * 1.2)
    ) {
      return "warning";
    } else {
      return "critical";
    }
  }

  private calculatePressureStatus(
    systolic: number,
    diastolic: number
  ): "normal" | "warning" | "critical" {
    // Estos valores deberían venir del perfil del usuario
    const systolicMin = 90;
    const systolicMax = 140;
    const diastolicMin = 60;
    const diastolicMax = 90;

    const systolicStatus = this.getSystolicStatus(
      systolic,
      systolicMin,
      systolicMax
    );
    const diastolicStatus = this.getDiastolicStatus(
      diastolic,
      diastolicMin,
      diastolicMax
    );

    if (systolicStatus === "critical" || diastolicStatus === "critical") {
      return "critical";
    } else if (systolicStatus === "warning" || diastolicStatus === "warning") {
      return "warning";
    } else {
      return "normal";
    }
  }

  private getSystolicStatus(
    value: number,
    min: number,
    max: number
  ): "normal" | "warning" | "critical" {
    if (value >= min && value <= max) {
      return "normal";
    } else if (
      (value >= min * 0.9 && value < min) ||
      (value > max && value <= max * 1.2)
    ) {
      return "warning";
    } else {
      return "critical";
    }
  }

  private getDiastolicStatus(
    value: number,
    min: number,
    max: number
  ): "normal" | "warning" | "critical" {
    if (value >= min && value <= max) {
      return "normal";
    } else if (
      (value >= min * 0.9 && value < min) ||
      (value > max && value <= max * 1.2)
    ) {
      return "warning";
    } else {
      return "critical";
    }
  }
}

export const healthService = new HealthServiceImpl();
