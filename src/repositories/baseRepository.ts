export abstract class BaseLocalStorageRepository {
  protected getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return null;
    }
  }

  protected setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
    }
  }

  protected removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
    }
  }
}
