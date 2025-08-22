import { PressureMeasurement } from "../types/health";
import { migrateUTCToLocal } from "../utils/healthCalculations";

const STORAGE_KEY = "health_pressure_measurements";

export interface PressureRepository {
  getPressureMeasurements(): PressureMeasurement[];
  savePressureMeasurement(measurement: PressureMeasurement): void;
  updatePressureMeasurement(
    id: string,
    updates: Partial<PressureMeasurement>
  ): void;
  deletePressureMeasurement(id: string): void;
}

class LocalStoragePressureRepository implements PressureRepository {
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
    }
  }

  getPressureMeasurements(): PressureMeasurement[] {
    const measurements = this.getItem<PressureMeasurement[]>(STORAGE_KEY);
    if (!measurements) return [];

    return measurements.map((measurement) => ({
      ...measurement,
      timestamp: migrateUTCToLocal(measurement.timestamp.toString()),
    }));
  }

  savePressureMeasurement(measurement: PressureMeasurement): void {
    const measurements = this.getPressureMeasurements();
    measurements.push(measurement);
    this.setItem(STORAGE_KEY, measurements);
  }

  updatePressureMeasurement(
    id: string,
    updates: Partial<PressureMeasurement>
  ): void {
    const measurements = this.getPressureMeasurements();
    const index = measurements.findIndex((m) => m.id === id);
    if (index !== -1) {
      measurements[index] = { ...measurements[index], ...updates };
      this.setItem(STORAGE_KEY, measurements);
    }
  }

  deletePressureMeasurement(id: string): void {
    const measurements = this.getPressureMeasurements();
    const filtered = measurements.filter((m) => m.id !== id);
    this.setItem(STORAGE_KEY, filtered);
  }
}

export const pressureRepository = new LocalStoragePressureRepository();
