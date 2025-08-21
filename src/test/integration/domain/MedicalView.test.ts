import { describe, it, expect, beforeEach } from "vitest";
import {
  MedicalView,
  generateMedicalSummary,
} from "../../../domain/MedicalView";
import { UserProfile } from "../../../domain/UserProfile";
import { GlucoseMeasurement } from "../../../domain/GlucoseMeasurement";
import { PressureMeasurement } from "../../../domain/PressureMeasurement";
import { FoodEntry } from "../../../domain/FoodEntry";

describe("MedicalView Domain Integration Tests", () => {
  let medicalView: MedicalView;
  let userProfile: UserProfile;
  let glucoseMeasurements: GlucoseMeasurement[];
  let pressureMeasurements: PressureMeasurement[];
  let foodEntries: FoodEntry[];

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

    glucoseMeasurements = [
      new GlucoseMeasurement({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        value: 95,
        context: "fasting",
        status: "normal",
      }),
      new GlucoseMeasurement({
        id: "2",
        userId: "1",
        timestamp: new Date("2024-01-15T12:00:00Z"),
        value: 120,
        context: "postPrandial",
        status: "warning",
      }),
      new GlucoseMeasurement({
        id: "3",
        userId: "1",
        timestamp: new Date("2024-01-15T18:00:00Z"),
        value: 150,
        context: "postPrandial",
        status: "critical",
      }),
    ];

    pressureMeasurements = [
      new PressureMeasurement({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        systolic: 120,
        diastolic: 80,
        status: "normal",
      }),
      new PressureMeasurement({
        id: "2",
        userId: "1",
        timestamp: new Date("2024-01-15T20:00:00Z"),
        systolic: 135,
        diastolic: 85,
        status: "warning",
      }),
    ];

    foodEntries = [
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

    medicalView = new MedicalView({
      userId: "1",
      date: new Date("2024-01-15"),
      userProfile,
      glucoseMeasurements,
      pressureMeasurements,
      foodEntries,
    });
  });

  describe("MedicalView Creation", () => {
    it("should create a valid medical view", () => {
      expect(medicalView.userId).toBe("1");
      expect(medicalView.date).toEqual(new Date("2024-01-15"));
      expect(medicalView.userProfile).toBe(userProfile);
      expect(medicalView.glucoseMeasurements).toHaveLength(3);
      expect(medicalView.pressureMeasurements).toHaveLength(2);
      expect(medicalView.foodEntries).toHaveLength(3);
    });
  });

  describe("Glucose Summary", () => {
    it("should calculate glucose summary correctly", () => {
      const summary = medicalView.getGlucoseSummary();

      expect(summary.totalMeasurements).toBe(3);
      expect(summary.normalCount).toBe(1);
      expect(summary.warningCount).toBe(1);
      expect(summary.criticalCount).toBe(1);
      expect(summary.normalPercentage).toBeCloseTo(33.33, 1);
      expect(summary.warningPercentage).toBeCloseTo(33.33, 1);
      expect(summary.criticalPercentage).toBeCloseTo(33.33, 1);
    });

    it("should calculate average glucose values", () => {
      const summary = medicalView.getGlucoseSummary();

      expect(summary.averageValue).toBeCloseTo(121.67, 1);
      expect(summary.minValue).toBe(95);
      expect(summary.maxValue).toBe(150);
    });

    it("should categorize glucose by context", () => {
      const summary = medicalView.getGlucoseSummary();

      expect(summary.byContext.fasting).toHaveLength(1);
      expect(summary.byContext.postPrandial).toHaveLength(2);
      expect(summary.byContext.fasting[0].value).toBe(95);
    });
  });

  describe("Pressure Summary", () => {
    it("should calculate pressure summary correctly", () => {
      const summary = medicalView.getPressureSummary();

      expect(summary.totalMeasurements).toBe(2);
      expect(summary.normalCount).toBe(1);
      expect(summary.warningCount).toBe(1);
      expect(summary.criticalCount).toBe(0);
      expect(summary.normalPercentage).toBe(50);
      expect(summary.warningPercentage).toBe(50);
      expect(summary.criticalPercentage).toBe(0);
    });

    it("should calculate average pressure values", () => {
      const summary = medicalView.getPressureSummary();

      expect(summary.averageSystolic).toBe(127.5);
      expect(summary.averageDiastolic).toBe(82.5);
      expect(summary.minSystolic).toBe(120);
      expect(summary.maxSystolic).toBe(135);
      expect(summary.minDiastolic).toBe(80);
      expect(summary.maxDiastolic).toBe(85);
    });
  });

  describe("Nutritional Summary", () => {
    it("should calculate food summary correctly", () => {
      const summary = medicalView.getNutritionalSummary();

      expect(summary.totalEntries).toBe(3);
      expect(summary.totalCalories).toBe(415); // 130 + 225 + 60
      expect(summary.byType.carbohydrates).toHaveLength(1);
      expect(summary.byType.proteins).toHaveLength(1);
      expect(summary.byType.vegetables).toHaveLength(1);
    });

    it("should calculate calories by food type", () => {
      const summary = medicalView.getNutritionalSummary();

      expect(summary.caloriesByType.carbohydrates).toBe(130);
      expect(summary.caloriesByType.proteins).toBe(225);
      expect(summary.caloriesByType.vegetables).toBe(60);
    });

    it("should calculate total quantities by food type", () => {
      const summary = medicalView.getNutritionalSummary();

      expect(summary.quantitiesByType.carbohydrates).toBe(100);
      expect(summary.quantitiesByType.proteins).toBe(150);
      expect(summary.quantitiesByType.vegetables).toBe(200);
    });
  });

  describe("Overall Health Status", () => {
    it("should calculate overall health score", () => {
      const score = medicalView.calculateHealthScore();

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should determine overall health status", () => {
      const status = medicalView.getOverallHealthStatus();

      expect(["excellent", "good", "fair", "poor"]).toContain(status);
    });

    it("should identify critical alerts", () => {
      const alerts = medicalView.getCriticalAlerts();

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe("glucose");
      expect(alerts[0].value).toBe(150);
      expect(alerts[0].severity).toBe("critical");
    });
  });

  describe("Trends Analysis", () => {
    it("should identify glucose trends", () => {
      const trends = medicalView.analyzeGlucoseTrends();

      expect(trends.direction).toBe("increasing");
      expect(trends.volatility).toBeGreaterThan(0);
      expect(trends.recommendation).toBeDefined();
    });

    it("should identify pressure trends", () => {
      const trends = medicalView.analyzePressureTrends();

      expect(trends.systolicDirection).toBeDefined();
      expect(trends.diastolicDirection).toBeDefined();
      expect(trends.recommendation).toBeDefined();
    });
  });

  describe("Medical Summary Generation", () => {
    it("should generate comprehensive medical summary", () => {
      const summary = generateMedicalSummary(medicalView);

      expect(summary.date).toEqual(new Date("2024-01-15"));
      expect(summary.patientName).toBe("Juan Pérez");
      expect(summary.glucoseSummary).toBeDefined();
      expect(summary.pressureSummary).toBeDefined();
      expect(summary.nutritionalSummary).toBeDefined();
      expect(summary.overallStatus).toBeDefined();
      expect(summary.recommendations).toBeInstanceOf(Array);
    });

    it("should include actionable recommendations", () => {
      const summary = generateMedicalSummary(medicalView);

      expect(summary.recommendations.length).toBeGreaterThan(0);
      summary.recommendations.forEach((recommendation) => {
        expect(recommendation.priority).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.action).toBeDefined();
      });
    });
  });

  describe("Data Export", () => {
    it("should export medical view data correctly", () => {
      const exported = medicalView.export();

      expect(exported.userId).toBe("1");
      expect(exported.date).toEqual(new Date("2024-01-15"));
      expect(exported.glucoseMeasurements).toHaveLength(3);
      expect(exported.pressureMeasurements).toHaveLength(2);
      expect(exported.foodEntries).toHaveLength(3);
    });

    it("should export summary data for reporting", () => {
      const summary = medicalView.exportSummary();

      expect(summary.date).toEqual(new Date("2024-01-15"));
      expect(summary.glucoseSummary).toBeDefined();
      expect(summary.pressureSummary).toBeDefined();
      expect(summary.nutritionalSummary).toBeDefined();
      expect(summary.healthScore).toBeDefined();
      expect(summary.alerts).toBeInstanceOf(Array);
    });
  });

  describe("Date Range Analysis", () => {
    it("should filter measurements by date range", () => {
      const startDate = new Date("2024-01-15T00:00:00Z");
      const endDate = new Date("2024-01-15T12:00:00Z");

      const filtered = medicalView.getMeasurementsInRange(startDate, endDate);

      expect(filtered.glucoseMeasurements).toHaveLength(2);
      expect(filtered.pressureMeasurements).toHaveLength(1);
      expect(filtered.foodEntries).toHaveLength(2);
    });
  });
});
