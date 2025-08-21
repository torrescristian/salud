export type FoodType =
  | "carbohydrates"
  | "proteins"
  | "vegetables"
  | "eggs"
  | "dairy";

export interface FoodEntryData {
  id: string;
  userId: string;
  timestamp: Date;
  foodType: FoodType;
  description: string;
  quantity: number;
  emoji: string;
}

export class FoodEntry {
  public readonly id: string;
  public readonly userId: string;
  public timestamp: Date;
  public foodType: FoodType;
  public description: string;
  public quantity: number;
  public emoji: string;

  constructor(
    data: Partial<FoodEntryData> & {
      id: string;
      userId: string;
      description: string;
      quantity: number;
      foodType?: FoodType;
    }
  ) {
    this.validateData(data);

    this.id = data.id;
    this.userId = data.userId;
    this.timestamp = data.timestamp || new Date();
    this.foodType = data.foodType || this.autoCategorize(data.description);
    this.description = data.description;
    this.quantity = data.quantity;
    this.emoji = data.emoji || getFoodEmoji(this.foodType);
  }

  private validateData(
    data: Partial<FoodEntryData> & {
      id: string;
      userId: string;
      description: string;
      quantity: number;
      foodType?: FoodType;
    }
  ): void {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    if (data.foodType && !this.isValidFoodType(data.foodType)) {
      throw new Error("Invalid food type");
    }
  }

  private isValidFoodType(type: string): type is FoodType {
    return [
      "carbohydrates",
      "proteins",
      "vegetables",
      "eggs",
      "dairy",
    ].includes(type);
  }

  private autoCategorize(description: string): FoodType {
    return categorizeFood(description);
  }

  public updateFoodType(newType: FoodType): void {
    if (!this.isValidFoodType(newType)) {
      throw new Error("Invalid food type");
    }
    this.foodType = newType;
    this.emoji = getFoodEmoji(newType);
  }

  public updateDescription(newDescription: string): void {
    this.description = newDescription;
  }

  public updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    this.quantity = newQuantity;
  }

  public updateTimestamp(newTimestamp: Date): void {
    this.timestamp = newTimestamp;
  }

  public calculateCalories(): number {
    const caloriesPerGram = {
      carbohydrates: 1.3,
      proteins: 1.5,
      vegetables: 0.3,
      eggs: 1.5,
      dairy: 1.0,
    };

    return Math.round(this.quantity * caloriesPerGram[this.foodType]);
  }

  public export(): FoodEntryData {
    return {
      id: this.id,
      userId: this.userId,
      timestamp: this.timestamp,
      foodType: this.foodType,
      description: this.description,
      quantity: this.quantity,
      emoji: this.emoji,
    };
  }
}

export function getFoodEmoji(foodType: FoodType): string {
  const emojis: Record<FoodType, string> = {
    carbohydrates: "🍞",
    proteins: "🍗",
    vegetables: "🥦",
    eggs: "🥚",
    dairy: "🥛",
  };
  return emojis[foodType] || "🍽️";
}

export function categorizeFood(description: string): FoodType {
  const lowerDescription = description.toLowerCase();

  // Carbohydrates
  if (
    [
      "pan",
      "arroz",
      "pasta",
      "papas",
      "tortilla",
      "galleta",
      "dulce",
      "postre",
    ].some((food) => lowerDescription.includes(food))
  ) {
    return "carbohydrates";
  }

  // Proteins
  if (
    ["pollo", "pescado", "carne", "cerdo", "pavo"].some((food) =>
      lowerDescription.includes(food)
    )
  ) {
    return "proteins";
  }

  // Vegetables
  if (
    ["brócoli", "espinaca", "lechuga", "zanahoria", "tomate"].some((food) =>
      lowerDescription.includes(food)
    )
  ) {
    return "vegetables";
  }

  // Eggs
  if (
    ["huevo", "huevos", "omelette"].some((food) =>
      lowerDescription.includes(food)
    )
  ) {
    return "eggs";
  }

  // Dairy
  if (
    ["leche", "queso", "yogur", "mantequilla"].some((food) =>
      lowerDescription.includes(food)
    )
  ) {
    return "dairy";
  }

  // Default to carbohydrates for unknown foods
  return "carbohydrates";
}
