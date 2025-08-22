import { UserMedication } from "../types/health";

const STORAGE_KEYS = {
  MEDICATIONS: "health_medications",
  SUGGESTIONS: "health_medication_suggestions",
} as const;

export interface MedicationRepository {
  getMedications(): UserMedication[];
  saveMedication(medication: UserMedication): void;
  updateMedication(id: string, updates: Partial<UserMedication>): void;
  deleteMedication(id: string): void;
  getMedicationSuggestions(): Array<{ name: string; usageCount: number; lastUsed: Date }>;
  saveMedicationSuggestion(name: string): void;
}

class LocalStorageMedicationRepository implements MedicationRepository {
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

  getMedications(): UserMedication[] {
    const medications = this.getItem<UserMedication[]>(STORAGE_KEYS.MEDICATIONS);
    if (!medications) return [];
    
    return medications.map(med => ({
      ...med,
      lastUsed: new Date(med.lastUsed),
    }));
  }

  saveMedication(medication: UserMedication): void {
    const medications = this.getMedications();
    medications.push(medication);
    this.setItem(STORAGE_KEYS.MEDICATIONS, medications);
    
    this.saveMedicationSuggestion(medication.name);
  }

  updateMedication(id: string, updates: Partial<UserMedication>): void {
    const medications = this.getMedications();
    const index = medications.findIndex(med => med.id === id);
    if (index !== -1) {
      medications[index] = { ...medications[index], ...updates };
      this.setItem(STORAGE_KEYS.MEDICATIONS, medications);
    }
  }

  deleteMedication(id: string): void {
    const medications = this.getMedications();
    const filtered = medications.filter(med => med.id !== id);
    this.setItem(STORAGE_KEYS.MEDICATIONS, filtered);
  }

  getMedicationSuggestions(): Array<{ name: string; usageCount: number; lastUsed: Date }> {
    const suggestions = this.getItem<Array<{ name: string; usageCount: number; lastUsed: string }>>(STORAGE_KEYS.SUGGESTIONS);
    if (!suggestions) return [];
    
    return suggestions.map(suggestion => ({
      ...suggestion,
      lastUsed: new Date(suggestion.lastUsed),
    }));
  }

  saveMedicationSuggestion(name: string): void {
    const suggestions = this.getMedicationSuggestions();
    const existingIndex = suggestions.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex !== -1) {
      suggestions[existingIndex].usageCount += 1;
      suggestions[existingIndex].lastUsed = new Date();
    } else {
      suggestions.push({
        name,
        usageCount: 1,
        lastUsed: new Date(),
      });
    }
    
    suggestions.sort((a, b) => {
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return b.lastUsed.getTime() - a.lastUsed.getTime();
    });
    
    this.setItem(STORAGE_KEYS.SUGGESTIONS, suggestions);
  }
}

export const medicationRepository = new LocalStorageMedicationRepository();
