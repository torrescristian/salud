import { FoodEntry } from '../../domain/FoodEntry';
import { FoodEntryRepository } from '../FoodEntryRepository';

export class InMemoryFoodEntryRepository implements FoodEntryRepository {
  private entries: FoodEntry[] = [];

  async save(entry: FoodEntry): Promise<FoodEntry> {
    const existingIndex = this.entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      this.entries[existingIndex] = entry;
    } else {
      this.entries.push(entry);
    }
    
    return entry;
  }

  async findById(id: string): Promise<FoodEntry | null> {
    return this.entries.find(e => e.id === id) || null;
  }

  async findByUserId(userId: string): Promise<FoodEntry[]> {
    return this.entries.filter(e => e.userId === userId);
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FoodEntry[]> {
    return this.entries.filter(e => 
      e.userId === userId &&
      e.timestamp >= startDate &&
      e.timestamp <= endDate
    );
  }

  async update(id: string, entry: Partial<FoodEntry>): Promise<FoodEntry> {
    const existingIndex = this.entries.findIndex(e => e.id === id);
    
    if (existingIndex === -1) {
      throw new Error(`Food entry with id ${id} not found`);
    }
    
    this.entries[existingIndex] = { ...this.entries[existingIndex], ...entry };
    return this.entries[existingIndex];
  }

  async delete(id: string): Promise<void> {
    const index = this.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }

  async findByFoodType(userId: string, foodType: string): Promise<FoodEntry[]> {
    return this.entries.filter(e => 
      e.userId === userId && e.foodType === foodType
    );
  }

  async findTodayEntries(userId: string): Promise<FoodEntry[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    return this.entries.filter(e => 
      e.userId === userId &&
      e.timestamp >= startOfDay &&
      e.timestamp <= endOfDay
    );
  }

  async findWeeklyEntries(userId: string): Promise<FoodEntry[]> {
    const today = new Date();
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.entries.filter(e => 
      e.userId === userId &&
      e.timestamp >= startOfWeek &&
      e.timestamp <= today
    );
  }
}
