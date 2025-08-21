import { describe, it, expect, beforeEach, vi } from "vitest";
import { FoodEntryUseCase } from "../../../use-cases/FoodEntryUseCase";
import { FoodEntryRepository } from "../../../domain/repositories/FoodEntryRepository";
import { UserProfileRepository } from "../../../domain/repositories/UserProfileRepository";
import { FoodEntry } from "../../../domain/FoodEntry";
import { UserProfile } from "../../../domain/UserProfile";

describe("FoodEntryUseCase Integration Tests", () => {
  let foodEntryUseCase: FoodEntryUseCase;
  let mockFoodRepository: FoodEntryRepository;
  let mockUserProfileRepository: UserProfileRepository;
  let testUserProfile: UserProfile;

  beforeEach(() => {
    mockFoodRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndDate: vi.fn(),
      findByUserIdAndType: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockUserProfileRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };

    foodEntryUseCase = new FoodEntryUseCase(
      mockFoodRepository,
      mockUserProfileRepository
    );

    testUserProfile = new UserProfile({
      id: "1",
      name: "Juan Pérez",
      birthDate: new Date("1980-01-01"),
      weight: 70,
      height: 170,
      medicalConditions: ["diabetes"],
      glucoseLimits: {
        fasting: { min: 70, max: 100 },
        postPrandial: { min: 100, max: 140 },
        custom: [],
      },
      pressureLimits: {
        systolic: { min: 110, max: 120 },
        diastolic: { min: 70, max: 80 },
      },
      measurementFrequency: {
        glucose: 3,
        pressure: 2,
      },
    });
  });

  describe("Food Entry Creation", () => {
    it("should create food entry successfully", async () => {
      const foodData = {
        userId: "1",
        foodType: "carbohydrates" as const,
        description: "Pan integral",
        quantity: 100,
      };

      const expectedFoodEntry = new FoodEntry({
        id: "1",
        ...foodData,
        timestamp: expect.any(Date),
        emoji: "🍞",
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockFoodRepository.save = vi.fn().mockResolvedValue(expectedFoodEntry);

      const result = await foodEntryUseCase.createFoodEntry(foodData);

      expect(mockUserProfileRepository.findById).toHaveBeenCalledWith("1");
      expect(mockFoodRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "1",
          foodType: "carbohydrates",
          description: "Pan integral",
          quantity: 100,
          emoji: "🍞",
        })
      );
      expect(result.foodType).toBe("carbohydrates");
      expect(result.emoji).toBe("🍞");
    });

    it("should auto-categorize food based on description", async () => {
      const foodData = {
        userId: "1",
        description: "Pollo asado",
        quantity: 150,
      };

      const expectedFoodEntry = new FoodEntry({
        id: "1",
        ...foodData,
        foodType: "proteins",
        timestamp: expect.any(Date),
        emoji: "🍗",
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockFoodRepository.save = vi.fn().mockResolvedValue(expectedFoodEntry);

      const result = await foodEntryUseCase.createFoodEntry(foodData);

      expect(result.foodType).toBe("proteins");
      expect(result.emoji).toBe("🍗");
    });

    it("should assign correct emoji for each food type", async () => {
      const foodTypes = [
        { type: "carbohydrates", description: "Arroz", expectedEmoji: "🍞" },
        { type: "proteins", description: "Pescado", expectedEmoji: "🍗" },
        { type: "vegetables", description: "Brócoli", expectedEmoji: "🥦" },
        { type: "eggs", description: "Huevos", expectedEmoji: "🥚" },
        { type: "dairy", description: "Leche", expectedEmoji: "🥛" },
      ];

      for (const { type, description, expectedEmoji } of foodTypes) {
        const foodData = {
          userId: "1",
          foodType: type as any,
          description,
          quantity: 100,
        };

        const expectedFoodEntry = new FoodEntry({
          id: `1-${type}`,
          ...foodData,
          timestamp: expect.any(Date),
          emoji: expectedEmoji,
        });

        mockUserProfileRepository.findById = vi
          .fn()
          .mockResolvedValue(testUserProfile);
        mockFoodRepository.save = vi.fn().mockResolvedValue(expectedFoodEntry);

        const result = await foodEntryUseCase.createFoodEntry(foodData);

        expect(result.emoji).toBe(expectedEmoji);
      }
    });

    it("should throw error for invalid food type", async () => {
      const invalidData = {
        userId: "1",
        foodType: "invalid" as any,
        description: "Test food",
        quantity: 100,
      };

      await expect(
        foodEntryUseCase.createFoodEntry(invalidData)
      ).rejects.toThrow("Invalid food type");
    });

    it("should throw error for invalid quantity", async () => {
      const invalidData = {
        userId: "1",
        foodType: "carbohydrates" as const,
        description: "Test food",
        quantity: -50,
      };

      await expect(
        foodEntryUseCase.createFoodEntry(invalidData)
      ).rejects.toThrow("Quantity must be positive");
    });

    it("should throw error when user profile not found", async () => {
      const foodData = {
        userId: "999",
        foodType: "carbohydrates" as const,
        description: "Test food",
        quantity: 100,
      };

      mockUserProfileRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(foodEntryUseCase.createFoodEntry(foodData)).rejects.toThrow(
        "User profile not found"
      );
    });
  });

  describe("Food Entry Retrieval", () => {
    it("should get food entries for user", async () => {
      const foodEntries = [
        new FoodEntry({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          foodType: "carbohydrates",
          description: "Pan integral",
          quantity: 100,
          emoji: "🍞",
        }),
        new FoodEntry({
          id: "2",
          userId: "1",
          timestamp: new Date("2024-01-15T12:00:00Z"),
          foodType: "proteins",
          description: "Pollo",
          quantity: 150,
          emoji: "🍗",
        }),
      ];

      mockFoodRepository.findByUserId = vi.fn().mockResolvedValue(foodEntries);

      const result = await foodEntryUseCase.getFoodEntries("1");

      expect(mockFoodRepository.findByUserId).toHaveBeenCalledWith("1");
      expect(result).toHaveLength(2);
      expect(result[0].description).toBe("Pan integral");
      expect(result[1].description).toBe("Pollo");
    });

    it("should get food entries by date", async () => {
      const date = new Date("2024-01-15");
      const foodEntries = [
        new FoodEntry({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          foodType: "carbohydrates",
          description: "Pan integral",
          quantity: 100,
          emoji: "🍞",
        }),
      ];

      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(foodEntries);

      const result = await foodEntryUseCase.getFoodEntriesByDate("1", date);

      expect(mockFoodRepository.findByUserIdAndDate).toHaveBeenCalledWith(
        "1",
        date
      );
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Pan integral");
    });

    it("should get food entries by type", async () => {
      const foodEntries = [
        new FoodEntry({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          foodType: "carbohydrates",
          description: "Pan integral",
          quantity: 100,
          emoji: "🍞",
        }),
        new FoodEntry({
          id: "2",
          userId: "1",
          timestamp: new Date("2024-01-15T12:00:00Z"),
          foodType: "carbohydrates",
          description: "Arroz",
          quantity: 200,
          emoji: "🍞",
        }),
      ];

      mockFoodRepository.findByUserIdAndType = vi
        .fn()
        .mockResolvedValue(foodEntries);

      const result = await foodEntryUseCase.getFoodEntriesByType(
        "1",
        "carbohydrates"
      );

      expect(mockFoodRepository.findByUserIdAndType).toHaveBeenCalledWith(
        "1",
        "carbohydrates"
      );
      expect(result).toHaveLength(2);
      expect(result.every((entry) => entry.foodType === "carbohydrates")).toBe(
        true
      );
    });
  });

  describe("Food Entry Updates", () => {
    it("should update food entry successfully", async () => {
      const existingFoodEntry = new FoodEntry({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        foodType: "carbohydrates",
        description: "Pan integral",
        quantity: 100,
        emoji: "🍞",
      });

      const updateData = {
        description: "Pan de centeno",
        quantity: 150,
      };

      mockFoodRepository.findById = vi
        .fn()
        .mockResolvedValue(existingFoodEntry);
      mockFoodRepository.update = vi.fn().mockResolvedValue({
        ...existingFoodEntry,
        ...updateData,
      });

      const result = await foodEntryUseCase.updateFoodEntry("1", updateData);

      expect(mockFoodRepository.findById).toHaveBeenCalledWith("1");
      expect(mockFoodRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining(updateData)
      );
      expect(result.description).toBe("Pan de centeno");
      expect(result.quantity).toBe(150);
    });

    it("should update food type and emoji when food type changes", async () => {
      const existingFoodEntry = new FoodEntry({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        foodType: "carbohydrates",
        description: "Pan integral",
        quantity: 100,
        emoji: "🍞",
      });

      const updateData = {
        foodType: "proteins" as const,
        description: "Pollo",
      };

      mockFoodRepository.findById = vi
        .fn()
        .mockResolvedValue(existingFoodEntry);
      mockFoodRepository.update = vi.fn().mockResolvedValue({
        ...existingFoodEntry,
        ...updateData,
        emoji: "🍗",
      });

      const result = await foodEntryUseCase.updateFoodEntry("1", updateData);

      expect(result.foodType).toBe("proteins");
      expect(result.emoji).toBe("🍗");
    });

    it("should throw error when food entry not found", async () => {
      mockFoodRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(
        foodEntryUseCase.updateFoodEntry("999", { description: "Test" })
      ).rejects.toThrow("Food entry not found");
    });
  });

  describe("Food Entry Deletion", () => {
    it("should delete food entry successfully", async () => {
      const existingFoodEntry = new FoodEntry({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        foodType: "carbohydrates",
        description: "Pan integral",
        quantity: 100,
        emoji: "🍞",
      });

      mockFoodRepository.findById = vi
        .fn()
        .mockResolvedValue(existingFoodEntry);
      mockFoodRepository.delete = vi.fn().mockResolvedValue(true);

      const result = await foodEntryUseCase.deleteFoodEntry("1");

      expect(mockFoodRepository.findById).toHaveBeenCalledWith("1");
      expect(mockFoodRepository.delete).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });

    it("should throw error when food entry not found for deletion", async () => {
      mockFoodRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(foodEntryUseCase.deleteFoodEntry("999")).rejects.toThrow(
        "Food entry not found"
      );
    });
  });

  describe("Nutritional Analysis", () => {
    it("should calculate daily nutritional summary", async () => {
      const foodEntries = [
        new FoodEntry({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          foodType: "carbohydrates",
          description: "Pan integral",
          quantity: 100,
          emoji: "🍞",
        }),
        new FoodEntry({
          id: "2",
          userId: "1",
          timestamp: new Date("2024-01-15T12:00:00Z"),
          foodType: "proteins",
          description: "Pollo",
          quantity: 150,
          emoji: "🍗",
        }),
        new FoodEntry({
          id: "3",
          userId: "1",
          timestamp: new Date("2024-01-15T18:00:00Z"),
          foodType: "vegetables",
          description: "Brócoli",
          quantity: 200,
          emoji: "🥦",
        }),
      ];

      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(foodEntries);

      const summary = await foodEntryUseCase.getDailyNutritionalSummary(
        "1",
        new Date("2024-01-15")
      );

      expect(summary.totalEntries).toBe(3);
      expect(summary.totalCalories).toBe(415); // 130 + 225 + 60
      expect(summary.byType.carbohydrates).toHaveLength(1);
      expect(summary.byType.proteins).toHaveLength(1);
      expect(summary.byType.vegetables).toHaveLength(1);
      expect(summary.caloriesByType.carbohydrates).toBe(130);
      expect(summary.caloriesByType.proteins).toBe(225);
      expect(summary.caloriesByType.vegetables).toBe(60);
    });

    it("should calculate weekly nutritional trends", async () => {
      const weekStart = new Date("2024-01-15");
      const weekEnd = new Date("2024-01-21");

      const weeklyEntries = [
        // Day 1
        new FoodEntry({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          foodType: "carbohydrates",
          description: "Pan",
          quantity: 100,
          emoji: "🍞",
        }),
        // Day 2
        new FoodEntry({
          id: "2",
          userId: "1",
          timestamp: new Date("2024-01-16T08:00:00Z"),
          foodType: "proteins",
          description: "Pollo",
          quantity: 150,
          emoji: "🍗",
        }),
        new FoodEntry({
          id: "3",
          userId: "1",
          timestamp: new Date("2024-01-16T12:00:00Z"),
          foodType: "proteins",
          description: "Pescado",
          quantity: 100,
          emoji: "🐟",
        }),
        // Day 3
        new FoodEntry({
          id: "4",
          userId: "1",
          timestamp: new Date("2024-01-17T08:00:00Z"),
          foodType: "vegetables",
          description: "Ensalada",
          quantity: 50,
          emoji: "🥗",
        }),
      ];

      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(weeklyEntries);

      const trends = await foodEntryUseCase.getWeeklyNutritionalTrends(
        "1",
        weekStart,
        weekEnd
      );

      expect(trends.totalDays).toBe(3); // 3 días diferentes
      expect(trends.averageCaloriesPerDay).toBeCloseTo(173.33, 1); // (130 + 225 + 150 + 15) / 3
      expect(trends.mostConsumedType).toBe("proteins"); // 2 entradas
      expect(trends.leastConsumedType).toBe("carbohydrates"); // 1 entrada (empate con vegetables, pero carbohydrates viene primero alfabéticamente)
    });
  });

  describe("Food Recommendations", () => {
    it("should provide food recommendations based on user profile", async () => {
      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);

      const recommendations = await foodEntryUseCase.getFoodRecommendations(
        "1"
      );

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);

      recommendations.forEach((recommendation) => {
        expect(recommendation.foodType).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.reason).toBeDefined();
        expect(recommendation.priority).toBeDefined();
      });
    });

    it("should provide diabetes-friendly food recommendations", async () => {
      const diabeticProfile = new UserProfile({
        id: "2",
        name: "María García",
        birthDate: new Date("1985-05-15"),
        weight: 65,
        height: 165,
        medicalConditions: ["diabetes"],
        glucoseLimits: {
          fasting: { min: 70, max: 100 },
          postPrandial: { min: 100, max: 140 },
          custom: [],
        },
        pressureLimits: {
          systolic: { min: 110, max: 120 },
          diastolic: { min: 70, max: 80 },
        },
        measurementFrequency: {
          glucose: 3,
          pressure: 2,
        },
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(diabeticProfile);

      const recommendations = await foodEntryUseCase.getFoodRecommendations(
        "2"
      );

      expect(recommendations.some((r) => r.foodType === "vegetables")).toBe(
        true
      );
      expect(recommendations.some((r) => r.foodType === "proteins")).toBe(true);
      expect(recommendations.some((r) => r.reason.includes("diabetes"))).toBe(
        true
      );
    });
  });

  describe("Data Export", () => {
    it("should export food entries for reporting", async () => {
      const foodEntries = [
        new FoodEntry({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          foodType: "carbohydrates",
          description: "Pan integral",
          quantity: 100,
          emoji: "🍞",
        }),
      ];

      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(foodEntries);

      const exported = await foodEntryUseCase.exportFoodEntries(
        "1",
        new Date("2024-01-15")
      );

      expect(exported.date).toEqual(new Date("2024-01-15"));
      expect(exported.entries).toHaveLength(1);
      expect(exported.summary).toBeDefined();
      expect(exported.summary.totalCalories).toBe(130);
    });
  });
});
