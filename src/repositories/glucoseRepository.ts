import { GlucoseMeasurement } from "../types/health";
import { migrateUTCToLocal } from "../utils/healthCalculations";

const STORAGE_KEY = "health_glucose_measurements";

export interface GlucoseRepository {
  getGlucoseMeasurements(): GlucoseMeasurement[];
  saveGlucoseMeasurement(measurement: GlucoseMeasurement): void;
  updateGlucoseMeasurement(
    id: string,
    updates: Partial<GlucoseMeasurement>
  ): void;
  deleteGlucoseMeasurement(id: string): void;
}

class LocalStorageGlucoseRepository implements GlucoseRepository {
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

  getGlucoseMeasurements(): GlucoseMeasurement[] {
    const measurements = this.getItem<GlucoseMeasurement[]>(STORAGE_KEY);
    if (!measurements) return [];

    return measurements.map((measurement) => ({
      ...measurement,
      timestamp: migrateUTCToLocal(measurement.timestamp.toString()),
    }));
  }

  saveGlucoseMeasurement(measurement: GlucoseMeasurement): void {
    const measurements = this.getGlucoseMeasurements();
    measurements.push(measurement);
    this.setItem(STORAGE_KEY, measurements);
  }

  updateGlucoseMeasurement(
    id: string,
    updates: Partial<GlucoseMeasurement>
  ): void {
    const measurements = this.getGlucoseMeasurements();
    const index = measurements.findIndex((m) => m.id === id);
    if (index !== -1) {
      measurements[index] = { ...measurements[index], ...updates };
      this.setItem(STORAGE_KEY, measurements);
    }
  }

  deleteGlucoseMeasurement(id: string): void {
    const measurements = this.getGlucoseMeasurements();
    const filtered = measurements.filter((m) => m.id !== id);
    this.setItem(STORAGE_KEY, filtered);
  }
}

export const glucoseRepository = new LocalStorageGlucoseRepository();
