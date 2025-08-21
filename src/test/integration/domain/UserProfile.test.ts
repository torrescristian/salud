import { describe, it, expect, beforeEach } from "vitest";
import {
  UserProfile,
  calculateDefaultGlucoseLimits,
  calculateDefaultPressureLimits,
} from "../../../domain/UserProfile";

describe("UserProfile Domain Integration Tests", () => {
  let userProfile: UserProfile;

  beforeEach(() => {
    userProfile = new UserProfile({
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

  describe("UserProfile Creation", () => {
    it("should create a valid user profile with all required fields", () => {
      expect(userProfile.id).toBe("1");
      expect(userProfile.name).toBe("Juan Pérez");
      expect(userProfile.weight).toBe(70);
      expect(userProfile.height).toBe(170);
      expect(userProfile.medicalConditions).toContain("diabetes");
    });

    it("should calculate BMI correctly", () => {
      const bmi = userProfile.calculateBMI();
      expect(bmi).toBeCloseTo(24.22, 2);
    });

    it("should determine age category correctly", () => {
      const age = userProfile.getAge();
      expect(age).toBeGreaterThan(40);
    });
  });

  describe("Default Limits Calculation", () => {
    it("should calculate default glucose limits for young healthy person", () => {
      const limits = calculateDefaultGlucoseLimits(25, 65, 165);

      expect(limits.fasting.min).toBe(70);
      expect(limits.fasting.max).toBe(100);
      expect(limits.postPrandial.min).toBe(100);
      expect(limits.postPrandial.max).toBe(140);
    });

    it("should adjust glucose limits for older person", () => {
      const limits = calculateDefaultGlucoseLimits(65, 70, 170);

      expect(limits.fasting.max).toBeGreaterThan(100);
      expect(limits.postPrandial.max).toBeGreaterThan(140);
    });

    it("should adjust glucose limits for overweight person", () => {
      const limits = calculateDefaultGlucoseLimits(35, 90, 170);

      expect(limits.fasting.min).toBeGreaterThan(70);
      expect(limits.fasting.max).toBeGreaterThan(100);
    });

    it("should calculate default pressure limits for young healthy person", () => {
      const limits = calculateDefaultPressureLimits(25, 65, 165);

      expect(limits.systolic.min).toBe(110);
      expect(limits.systolic.max).toBe(120);
      expect(limits.diastolic.min).toBe(70);
      expect(limits.diastolic.max).toBe(80);
    });

    it("should adjust pressure limits for older person", () => {
      const limits = calculateDefaultPressureLimits(65, 70, 170);

      expect(limits.systolic.max).toBeGreaterThan(120);
      expect(limits.diastolic.max).toBeGreaterThan(80);
    });
  });

  describe("Profile Updates", () => {
    it("should update weight and recalculate BMI", () => {
      userProfile.updateWeight(75);

      expect(userProfile.weight).toBe(75);
      expect(userProfile.calculateBMI()).toBeCloseTo(25.95, 2);
    });

    it("should update measurement frequency", () => {
      userProfile.updateMeasurementFrequency("glucose", 4);

      expect(userProfile.measurementFrequency.glucose).toBe(4);
    });

    it("should update glucose limits", () => {
      const newLimits = { min: 80, max: 110 };
      userProfile.updateGlucoseLimits("fasting", newLimits);

      expect(userProfile.glucoseLimits.fasting).toEqual(newLimits);
    });
  });

  describe("Validation", () => {
    it("should validate weight is positive", () => {
      expect(() => {
        userProfile.updateWeight(-5);
      }).toThrow("Weight must be positive");
    });

    it("should validate height is positive", () => {
      expect(() => {
        userProfile.updateHeight(-170);
      }).toThrow("Height must be positive");
    });

    it("should validate glucose limits are valid", () => {
      expect(() => {
        userProfile.updateGlucoseLimits("fasting", { min: 100, max: 80 });
      }).toThrow("Min value must be less than max value");
    });
  });
});
