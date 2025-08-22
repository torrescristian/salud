import { InsulinEntry } from "../types/health";

const STORAGE_KEY = "health_insulin_entries";

export interface InsulinRepository {
  getInsulinEntries(): InsulinEntry[];
  saveInsulinEntry(entry: InsulinEntry): void;
  updateInsulinEntry(id: string, updates: Partial<InsulinEntry>): void;
  deleteInsulinEntry(id: string): void;
}

class LocalStorageInsulinRepository implements InsulinRepository {
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

  getInsulinEntries(): InsulinEntry[] {
    const entries = this.getItem<InsulinEntry[]>(STORAGE_KEY);
    if (!entries) return [];
    
    return entries.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  }

  saveInsulinEntry(entry: InsulinEntry): void {
    const entries = this.getInsulinEntries();
    entries.push(entry);
    this.setItem(STORAGE_KEY, entries);
  }

  updateInsulinEntry(id: string, updates: Partial<InsulinEntry>): void {
    const entries = this.getInsulinEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      this.setItem(STORAGE_KEY, entries);
    }
  }

  deleteInsulinEntry(id: string): void {
    const entries = this.getInsulinEntries();
    const filtered = entries.filter(e => e.id !== id);
    this.setItem(STORAGE_KEY, filtered);
  }
}

export const insulinRepository = new LocalStorageInsulinRepository();
