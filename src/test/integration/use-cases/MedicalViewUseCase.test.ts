import { describe, it, expect, beforeEach, vi } from "vitest";
import { MedicalViewUseCase } from "../../../use-cases/MedicalViewUseCase";
import { MedicalViewRepository } from "../../../domain/repositories/MedicalViewRepository";
import { UserProfileRepository } from "../../../domain/repositories/UserProfileRepository";
import { GlucoseMeasurementRepository } from "../../../domain/repositories/GlucoseMeasurementRepository";
import { PressureMeasurementRepository } from "../../../domain/repositories/PressureMeasurementRepository";
import { FoodEntryRepository } from "../../../domain/repositories/FoodEntryRepository";
import { MedicalView } from "../../../domain/MedicalView";
import { UserProfile } from "../../../domain/UserProfile";
import { GlucoseMeasurement } from "../../../domain/GlucoseMeasurement";
import { PressureMeasurement } from "../../../domain/PressureMeasurement";
import { FoodEntry } from "../../../domain/FoodEntry";

describe("MedicalViewUseCase Integration Tests", () => {
  let medicalViewUseCase: MedicalViewUseCase;
  let mockMedicalViewRepository: MedicalViewRepository;
  let mockUserProfileRepository: UserProfileRepository;
  let mockGlucoseRepository: GlucoseMeasurementRepository;
  let mockPressureRepository: PressureMeasurementRepository;
  let mockFoodRepository: FoodEntryRepository;
  let testUserProfile: UserProfile;

  beforeEach(() => {
    mockMedicalViewRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserIdAndDate: vi.fn(),
      findByUserIdAndDateRange: vi.fn(),
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

    mockGlucoseRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndDate: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockPressureRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndDate: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockFoodRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByUserIdAndDate: vi.fn(),
      findByUserIdAndType: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    medicalViewUseCase = new MedicalViewUseCase(
      mockMedicalViewRepository,
      mockGlucoseRepository,
      mockPressureRepository,
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

  describe("Medical View Generation", () => {
    it("should generate medical view for a specific date", async () => {
      const date = new Date("2024-01-15");
      const userId = "1";

      const glucoseMeasurements = [
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
      ];

      const pressureMeasurements = [
        new PressureMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          systolic: 120,
          diastolic: 80,
          status: "normal",
        }),
      ];

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

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(pressureMeasurements);
      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(foodEntries);
      mockMedicalViewRepository.save = vi
        .fn()
        .mockImplementation((medicalView) =>
          Promise.resolve({ ...medicalView, id: "generated-id" })
        );

      const medicalView = await medicalViewUseCase.generateMedicalView({
        userId,
        date,
      });

      expect(medicalView.userId).toBe(userId);
      expect(medicalView.date).toEqual(date);
      expect(medicalView.userProfile).toBe(testUserProfile);
      expect(medicalView.glucoseMeasurements).toHaveLength(2);
      expect(medicalView.pressureMeasurements).toHaveLength(1);
      expect(medicalView.foodEntries).toHaveLength(1);
    });

    it("should throw error when user profile not found", async () => {
      const date = new Date("2024-01-15");
      const userId = "999";

      mockUserProfileRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(
        medicalViewUseCase.generateMedicalView(userId, date)
      ).rejects.toThrow("User profile not found");
    });
  });

  describe("Medical View Retrieval", () => {
    it("should retrieve existing medical view by ID", async () => {
      const medicalViewId = "1";
      const existingMedicalView = new MedicalView({
        userId: "1",
        date: new Date("2024-01-15"),
        userProfile: testUserProfile,
        glucoseMeasurements: [],
        pressureMeasurements: [],
        foodEntries: [],
      });

      mockMedicalViewRepository.findById = vi
        .fn()
        .mockResolvedValue(existingMedicalView);

      const result = await medicalViewUseCase.getMedicalView(medicalViewId);

      expect(mockMedicalViewRepository.findById).toHaveBeenCalledWith(
        medicalViewId
      );
      expect(result).toEqual(existingMedicalView);
    });

    it("should retrieve medical view by user and date", async () => {
      const userId = "1";
      const date = new Date("2024-01-15");
      const existingMedicalView = new MedicalView({
        userId: "1",
        date: new Date("2024-01-15"),
        userProfile: testUserProfile,
        glucoseMeasurements: [],
        pressureMeasurements: [],
        foodEntries: [],
      });

      mockMedicalViewRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue([existingMedicalView]);

      const result = await medicalViewUseCase.getMedicalViewByDate(
        userId,
        date
      );

      expect(
        mockMedicalViewRepository.findByUserIdAndDate
      ).toHaveBeenCalledWith(userId, date);
      expect(result).toEqual(existingMedicalView);
    });

    it("should retrieve medical views by date range", async () => {
      const userId = "1";
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-01-21");

      const medicalViews = [
        new MedicalView({
          userId: "1",
          date: new Date("2024-01-15"),
          userProfile: testUserProfile,
          glucoseMeasurements: [],
          pressureMeasurements: [],
          foodEntries: [],
        }),
        new MedicalView({
          userId: "1",
          date: new Date("2024-01-16"),
          userProfile: testUserProfile,
          glucoseMeasurements: [],
          pressureMeasurements: [],
          foodEntries: [],
        }),
      ];

      mockMedicalViewRepository.findByUserIdAndDateRange = vi
        .fn()
        .mockResolvedValue(medicalViews);

      const result = await medicalViewUseCase.getMedicalViewsByDateRange(
        userId,
        startDate,
        endDate
      );

      expect(
        mockMedicalViewRepository.findByUserIdAndDateRange
      ).toHaveBeenCalledWith(userId, startDate, endDate);
      expect(result).toHaveLength(2);
    });
  });

  describe("Health Summary Generation", () => {
    it("should generate comprehensive health summary", async () => {
      const userId = "1";
      const date = new Date("2024-01-15");

      const glucoseMeasurements = [
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
          value: 150,
          context: "postPrandial",
          status: "critical",
        }),
      ];

      const pressureMeasurements = [
        new PressureMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          systolic: 135,
          diastolic: 85,
          status: "warning",
        }),
      ];

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

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(pressureMeasurements);
      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(foodEntries);

      const summary = await medicalViewUseCase.generateHealthSummary(
        userId,
        date
      );

      expect(summary.date).toEqual(date);
      expect(summary.patientName).toBe("Juan Pérez");
      expect(summary.glucoseSummary).toBeDefined();
      expect(summary.pressureSummary).toBeDefined();
      expect(summary.nutritionalSummary).toBeDefined();
      expect(summary.overallStatus).toBeDefined();
      expect(summary.recommendations).toBeInstanceOf(Array);
    });

    it("should include critical alerts in summary", async () => {
      const userId = "1";
      const date = new Date("2024-01-15");

      const glucoseMeasurements = [
        new GlucoseMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          value: 150,
          context: "postPrandial",
          status: "critical",
        }),
      ];

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue([]);
      mockFoodRepository.findByUserIdAndDate = vi.fn().mockResolvedValue([]);

      const summary = await medicalViewUseCase.generateHealthSummary(
        userId,
        date
      );

      expect(summary.alerts).toBeDefined();
      expect(summary.alerts.length).toBeGreaterThan(0);
      expect(
        summary.alerts.some((alert) => alert.severity === "critical")
      ).toBe(true);
    });
  });

  describe("Trends Analysis", () => {
    it("should analyze glucose trends over time", async () => {
      const userId = "1";
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-01-21");

      const glucoseMeasurements = [
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
          timestamp: new Date("2024-01-16T08:00:00Z"),
          value: 100,
          context: "fasting",
          status: "normal",
        }),
        new GlucoseMeasurement({
          id: "3",
          userId: "1",
          timestamp: new Date("2024-01-17T08:00:00Z"),
          value: 105,
          context: "fasting",
          status: "warning",
        }),
      ];

      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue([]);

      const trends = await medicalViewUseCase.analyzeGlucoseTrends(
        userId,
        startDate,
        endDate
      );

      expect(trends.glucoseTrend).toBeDefined();
      expect(trends.pressureTrend).toBeDefined();
      expect(trends.nutritionalTrend).toBeDefined();
      expect(trends.overallTrend).toBeDefined();
    });

    it("should analyze pressure trends over time", async () => {
      const userId = "1";
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-01-21");

      const pressureMeasurements = [
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
          timestamp: new Date("2024-01-16T08:00:00Z"),
          systolic: 125,
          diastolic: 82,
          status: "normal",
        }),
        new PressureMeasurement({
          id: "3",
          userId: "1",
          timestamp: new Date("2024-01-17T08:00:00Z"),
          systolic: 130,
          diastolic: 85,
          status: "warning",
        }),
      ];

      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(pressureMeasurements);
      mockGlucoseRepository.findByUserIdAndDate = vi.fn().mockResolvedValue([]);

      const trends = await medicalViewUseCase.analyzePressureTrends(
        userId,
        startDate,
        endDate
      );

      expect(trends.glucoseTrend).toBeDefined();
      expect(trends.pressureTrend).toBeDefined();
      expect(trends.nutritionalTrend).toBeDefined();
      expect(trends.overallTrend).toBeDefined();
      // dataPoints no es parte de la interfaz TrendsAnalysis, se eliminó esta expectativa
    });
  });

  describe("Medical Report Generation", () => {
    it("should generate printable medical report", async () => {
      const userId = "1";
      const date = new Date("2024-01-15");

      const glucoseMeasurements = [
        new GlucoseMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          value: 95,
          context: "fasting",
          status: "normal",
        }),
      ];

      const pressureMeasurements = [
        new PressureMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          systolic: 120,
          diastolic: 80,
          status: "normal",
        }),
      ];

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

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(pressureMeasurements);
      mockFoodRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(foodEntries);

      const report = await medicalViewUseCase.generateMedicalReport(
        userId,
        date,
        date
      );

      expect(report.userId).toBe(userId);
      expect(report.reportDate).toBeDefined();
      expect(report.healthSummary).toBeDefined();
      expect(report.trendsAnalysis).toBeDefined();
      expect(report.criticalAlerts).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.medicalSummary).toBeDefined();
    });

    it("should export medical report as PDF", async () => {
      const userId = "1";
      const date = new Date("2024-01-15");

      const glucoseMeasurements = [
        new GlucoseMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          value: 95,
          context: "fasting",
          status: "normal",
        }),
      ];

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue([]);
      mockFoodRepository.findByUserIdAndDate = vi.fn().mockResolvedValue([]);

      const pdfData = await medicalViewUseCase.exportMedicalReportAsPDF(
        userId,
        date
      );

      expect(pdfData).toBeDefined();
      expect(pdfData.filename).toContain("medical-report");
      expect(pdfData.pdfData).toBeDefined();
      expect(pdfData.contentType).toBe("application/pdf");
    });
  });

  describe("Data Persistence", () => {
    it("should save medical view to repository", async () => {
      const medicalView = new MedicalView({
        userId: "1",
        date: new Date("2024-01-15"),
        userProfile: testUserProfile,
        glucoseMeasurements: [],
        pressureMeasurements: [],
        foodEntries: [],
      });

      mockMedicalViewRepository.save = vi.fn().mockImplementation((mv) => {
        const savedView = { ...mv };
        savedView.id = "1";
        return Promise.resolve(savedView);
      });

      const result = await medicalViewUseCase.saveMedicalView(medicalView);

      expect(mockMedicalViewRepository.save).toHaveBeenCalledWith(medicalView);
      expect(result.id).toBe("1");
    });

    it("should update existing medical view", async () => {
      const medicalViewId = "1";
      const updateData = {
        glucoseMeasurements: [
          new GlucoseMeasurement({
            id: "1",
            userId: "1",
            timestamp: new Date("2024-01-15T08:00:00Z"),
            value: 95,
            context: "fasting",
            status: "normal",
          }),
        ],
      };

      const existingMedicalView = new MedicalView({
        id: "1",
        userId: "1",
        date: new Date("2024-01-15"),
        userProfile: testUserProfile,
        glucoseMeasurements: [],
        pressureMeasurements: [],
        foodEntries: [],
      });

      mockMedicalViewRepository.findById = vi
        .fn()
        .mockResolvedValue(existingMedicalView);
      mockMedicalViewRepository.update = vi.fn().mockResolvedValue({
        ...existingMedicalView,
        ...updateData,
      });

      const result = await medicalViewUseCase.updateMedicalView(
        medicalViewId,
        updateData
      );

      expect(mockMedicalViewRepository.findById).toHaveBeenCalledWith(
        medicalViewId
      );
      expect(mockMedicalViewRepository.update).toHaveBeenCalledWith(
        medicalViewId,
        expect.objectContaining(updateData)
      );
      expect(result.glucoseMeasurements).toHaveLength(1);
    });
  });
});
