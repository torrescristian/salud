import { FoodEntry } from '../FoodEntry';

export interface FoodEntryRepository {
  save(entry: FoodEntry): Promise<FoodEntry>;
  findById(id: string): Promise<FoodEntry | null>;
  update(id: string, data: Partial<FoodEntry>): Promise<FoodEntry>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<FoodEntry[]>;
  findByUserIdAndDate(userId: string, date: Date): Promise<FoodEntry[]>;
  findByUserIdAndType(userId: string, type: string): Promise<FoodEntry[]>;
}
