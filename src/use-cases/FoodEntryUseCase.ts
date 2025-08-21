import { FoodEntry, categorizeFood, getFoodEmoji } from "../domain/FoodEntry";
import { UserProfile } from "../domain/UserProfile";
import { FoodEntryRepository } from "../domain/repositories/FoodEntryRepository";
import { UserProfileRepository } from "../domain/repositories/UserProfileRepository";

export interface CreateFoodEntryData {
  userId: string;
  foodType?: "carbohydrates" | "proteins" | "vegetables" | "eggs" | "dairy";
  description: string;
  quantity: number;
}

export interface UpdateFoodEntryData {
  foodType?: "carbohydrates" | "proteins" | "vegetables" | "eggs" | "dairy";
  description?: string;
  quantity?: number;
}

export interface NutritionalSummary {
  totalEntries: number;
  totalCalories: number;
  byType: {
    carbohydrates: FoodEntry[];
    proteins: FoodEntry[];
    vegetables: FoodEntry[];
    eggs: FoodEntry[];
    dairy: FoodEntry[];
  };
  caloriesByType: {
    carbohydrates: number;
    proteins: number;
    vegetables: number;
    eggs: number;
    dairy: number;
  };
  quantitiesByType: {
    carbohydrates: number;
    proteins: number;
    vegetables: number;
    eggs: number;
    dairy: number;
  };
}

export interface WeeklyNutritionalTrends {
  totalDays: number;
  averageCaloriesPerDay: number;
  mostConsumedType: string;
  leastConsumedType: string;
}

export interface FoodRecommendation {
  foodType: string;
  description: string;
  reason: string;
  priority: string;
}

export class FoodEntryUseCase {
  constructor(
    private foodRepository: FoodEntryRepository,
    private userProfileRepository: UserProfileRepository
  ) {}

  async createFoodEntry(data: CreateFoodEntryData): Promise<FoodEntry> {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    // Validate food type early if provided
    if (data.foodType && !this.isValidFoodType(data.foodType)) {
      throw new Error("Invalid food type");
    }

    const userProfile = await this.userProfileRepository.findById(data.userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Auto-categorize if food type not provided
    const foodType = data.foodType || categorizeFood(data.description);

    const foodEntry = new FoodEntry({
      id: this.generateId(),
      ...data,
      foodType,
    });

    return await this.foodRepository.save(foodEntry);
  }

  async getFoodEntries(userId: string): Promise<FoodEntry[]> {
    return await this.foodRepository.findByUserId(userId);
  }

  async getFoodEntriesByDate(userId: string, date: Date): Promise<FoodEntry[]> {
    return await this.foodRepository.findByUserIdAndDate(userId, date);
  }

  async getFoodEntriesByType(
    userId: string,
    type: string
  ): Promise<FoodEntry[]> {
    return await this.foodRepository.findByUserIdAndType(userId, type);
  }

  async updateFoodEntry(
    id: string,
    data: UpdateFoodEntryData
  ): Promise<FoodEntry> {
    const existingEntry = await this.foodRepository.findById(id);
    if (!existingEntry) {
      throw new Error("Food entry not found");
    }

    if (data.foodType !== undefined) {
      if (!this.isValidFoodType(data.foodType)) {
        throw new Error("Invalid food type");
      }
      existingEntry.updateFoodType(data.foodType);
    }

    if (data.description !== undefined) {
      existingEntry.updateDescription(data.description);
    }

    if (data.quantity !== undefined) {
      existingEntry.updateQuantity(data.quantity);
    }

    return await this.foodRepository.update(id, existingEntry);
  }

  async deleteFoodEntry(id: string): Promise<boolean> {
    const existingEntry = await this.foodRepository.findById(id);
    if (!existingEntry) {
      throw new Error("Food entry not found");
    }

    return await this.foodRepository.delete(id);
  }

  async getDailyNutritionalSummary(
    userId: string,
    date: Date
  ): Promise<NutritionalSummary> {
    const foodEntries = await this.foodRepository.findByUserIdAndDate(
      userId,
      date
    );

    const byType = {
      carbohydrates: foodEntries.filter((f) => f.foodType === "carbohydrates"),
      proteins: foodEntries.filter((f) => f.foodType === "proteins"),
      vegetables: foodEntries.filter((f) => f.foodType === "vegetables"),
      eggs: foodEntries.filter((f) => f.foodType === "eggs"),
      dairy: foodEntries.filter((f) => f.foodType === "dairy"),
    };

    const caloriesByType = {
      carbohydrates: byType.carbohydrates.reduce(
        (sum, f) => sum + f.calculateCalories(),
        0
      ),
      proteins: byType.proteins.reduce(
        (sum, f) => sum + f.calculateCalories(),
        0
      ),
      vegetables: byType.vegetables.reduce(
        (sum, f) => sum + f.calculateCalories(),
        0
      ),
      eggs: byType.eggs.reduce((sum, f) => sum + f.calculateCalories(), 0),
      dairy: byType.dairy.reduce((sum, f) => sum + f.calculateCalories(), 0),
    };

    const quantitiesByType = {
      carbohydrates: byType.carbohydrates.reduce(
        (sum, f) => sum + f.quantity,
        0
      ),
      proteins: byType.proteins.reduce((sum, f) => sum + f.quantity, 0),
      vegetables: byType.vegetables.reduce((sum, f) => sum + f.quantity, 0),
      eggs: byType.eggs.reduce((sum, f) => sum + f.quantity, 0),
      dairy: byType.dairy.reduce((sum, f) => sum + f.quantity, 0),
    };

    return {
      totalEntries: foodEntries.length,
      totalCalories: Object.values(caloriesByType).reduce(
        (sum, calories) => sum + calories,
        0
      ),
      byType,
      caloriesByType,
      quantitiesByType,
    };
  }

  async getWeeklyNutritionalTrends(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WeeklyNutritionalTrends> {
    const foodEntries = await this.foodRepository.findByUserIdAndDate(
      userId,
      startDate
    );

    // Count unique days that have food entries
    const uniqueDays = new Set(
      foodEntries.map((entry) => entry.timestamp.toDateString())
    ).size;
    const totalDays = Math.max(1, uniqueDays);

    const totalCalories = foodEntries.reduce(
      (sum, entry) => sum + entry.calculateCalories(),
      0
    );
    const averageCaloriesPerDay = totalDays > 0 ? totalCalories / totalDays : 0;

    const typeCounts = {
      carbohydrates: foodEntries.filter((f) => f.foodType === "carbohydrates")
        .length,
      proteins: foodEntries.filter((f) => f.foodType === "proteins").length,
      vegetables: foodEntries.filter((f) => f.foodType === "vegetables").length,
      eggs: foodEntries.filter((f) => f.foodType === "eggs").length,
      dairy: foodEntries.filter((f) => f.foodType === "dairy").length,
    };

    // Filtrar solo los tipos que se han consumido (count > 0)
    const consumedTypes = Object.entries(typeCounts).filter(
      ([_, count]) => count > 0
    );

    const mostConsumedType =
      consumedTypes.length > 0
        ? consumedTypes.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        : Object.keys(typeCounts)[0];

    const leastConsumedType =
      consumedTypes.length > 0
        ? consumedTypes.reduce((a, b) => {
            if (a[1] < b[1]) return a;
            if (a[1] > b[1]) return b;
            // En caso de empate, tomar el que venga primero alfabéticamente
            return a[0] < b[0] ? a : b;
          })[0]
        : Object.keys(typeCounts)[0];

    return {
      totalDays,
      averageCaloriesPerDay,
      mostConsumedType,
      leastConsumedType,
    };
  }

  async getFoodRecommendations(userId: string): Promise<FoodRecommendation[]> {
    const userProfile = await this.userProfileRepository.findById(userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const recommendations: FoodRecommendation[] = [];

    // Check medical conditions for specific recommendations
    if (userProfile.medicalConditions.includes("diabetes")) {
      recommendations.push({
        foodType: "vegetables",
        description: "Brócoli, espinaca, lechuga",
        reason: "Vegetables help control blood sugar levels",
        priority: "high",
      });

      recommendations.push({
        foodType: "proteins",
        description: "Pollo, pescado, huevos",
        reason: "Lean proteins help maintain stable glucose",
        priority: "medium",
      });

      recommendations.push({
        foodType: "carbohydrates",
        description: "Granos enteros, arroz integral",
        reason: "Complex carbohydrates are better for diabetes management",
        priority: "medium",
      });
    }

    // General health recommendations
    recommendations.push({
      foodType: "vegetables",
      description: "Variedad de vegetales coloridos",
      reason: "Essential vitamins and minerals for overall health",
      priority: "low",
    });

    recommendations.push({
      foodType: "dairy",
      description: "Leche, yogur, queso bajo en grasa",
      reason: "Important source of calcium and protein",
      priority: "low",
    });

    return recommendations;
  }

  async exportFoodEntries(
    userId: string,
    date: Date
  ): Promise<{
    date: Date;
    entries: FoodEntry[];
    summary: NutritionalSummary;
  }> {
    const entries = await this.foodRepository.findByUserIdAndDate(userId, date);
    const summary = await this.getDailyNutritionalSummary(userId, date);

    return {
      date,
      entries,
      summary,
    };
  }

  private isValidFoodType(
    type: string
  ): type is "carbohydrates" | "proteins" | "vegetables" | "eggs" | "dairy" {
    return [
      "carbohydrates",
      "proteins",
      "vegetables",
      "eggs",
      "dairy",
    ].includes(type);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
