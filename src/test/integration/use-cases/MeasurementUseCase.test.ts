import { describe, it, expect, beforeEach, vi } from "vitest";
import { MeasurementUseCase } from "../../../use-cases/MeasurementUseCase";
import { GlucoseMeasurementRepository } from "../../../domain/repositories/GlucoseMeasurementRepository";
import { PressureMeasurementRepository } from "../../../domain/repositories/PressureMeasurementRepository";
import { UserProfileRepository } from "../../../domain/repositories/UserProfileRepository";
import { GlucoseMeasurement } from "../../../domain/GlucoseMeasurement";
import { PressureMeasurement } from "../../../domain/PressureMeasurement";
import { UserProfile } from "../../../domain/UserProfile";

describe("MeasurementUseCase Integration Tests", () => {
  let measurementUseCase: MeasurementUseCase;
  let mockGlucoseRepository: GlucoseMeasurementRepository;
  let mockPressureRepository: PressureMeasurementRepository;
  let mockUserProfileRepository: UserProfileRepository;
  let testUserProfile: UserProfile;

  beforeEach(() => {
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

    mockUserProfileRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };

    measurementUseCase = new MeasurementUseCase(
      mockGlucoseRepository,
      mockPressureRepository,
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

  describe("Glucose Measurement Management", () => {
    it("should create glucose measurement successfully", async () => {
      const measurementData = {
        userId: "1",
        value: 95,
        context: "fasting" as const,
      };

      const expectedMeasurement = new GlucoseMeasurement({
        id: "1",
        ...measurementData,
        timestamp: expect.any(Date),
        status: "normal",
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.save = vi
        .fn()
        .mockResolvedValue(expectedMeasurement);

      const result = await measurementUseCase.createGlucoseMeasurement(
        measurementData
      );

      expect(mockUserProfileRepository.findById).toHaveBeenCalledWith("1");
      expect(mockGlucoseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "1",
          value: 95,
          context: "fasting",
          status: "normal",
        })
      );
      expect(result.status).toBe("normal");
    });

    it("should calculate correct status based on user limits", async () => {
      const measurementData = {
        userId: "1",
        value: 150,
        context: "postPrandial" as const,
      };

      const expectedMeasurement = new GlucoseMeasurement({
        id: "1",
        ...measurementData,
        timestamp: expect.any(Date),
        status: "critical",
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.save = vi
        .fn()
        .mockResolvedValue(expectedMeasurement);

      const result = await measurementUseCase.createGlucoseMeasurement(
        measurementData
      );

      expect(result.status).toBe("critical");
    });

    it("should throw error for invalid glucose value", async () => {
      const invalidData = {
        userId: "1",
        value: -50,
        context: "fasting" as const,
      };

      await expect(
        measurementUseCase.createGlucoseMeasurement(invalidData)
      ).rejects.toThrow("Glucose value must be positive");
    });

    it("should throw error when user profile not found", async () => {
      const measurementData = {
        userId: "999",
        value: 95,
        context: "fasting" as const,
      };

      mockUserProfileRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(
        measurementUseCase.createGlucoseMeasurement(measurementData)
      ).rejects.toThrow("User profile not found");
    });
  });

  describe("Pressure Measurement Management", () => {
    it("should create pressure measurement successfully", async () => {
      const measurementData = {
        userId: "1",
        systolic: 120,
        diastolic: 80,
      };

      const expectedMeasurement = new PressureMeasurement({
        id: "1",
        ...measurementData,
        timestamp: expect.any(Date),
        status: "normal",
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockPressureRepository.save = vi
        .fn()
        .mockResolvedValue(expectedMeasurement);

      const result = await measurementUseCase.createPressureMeasurement(
        measurementData
      );

      expect(mockUserProfileRepository.findById).toHaveBeenCalledWith("1");
      expect(mockPressureRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "1",
          systolic: 120,
          diastolic: 80,
          status: "normal",
        })
      );
      expect(result.status).toBe("normal");
    });

    it("should calculate correct status based on user limits", async () => {
      const measurementData = {
        userId: "1",
        systolic: 135,
        diastolic: 85,
      };

      const expectedMeasurement = new PressureMeasurement({
        id: "1",
        ...measurementData,
        timestamp: expect.any(Date),
        status: "warning",
      });

      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockPressureRepository.save = vi
        .fn()
        .mockResolvedValue(expectedMeasurement);

      const result = await measurementUseCase.createPressureMeasurement(
        measurementData
      );

      expect(result.status).toBe("warning");
    });

    it("should throw error for invalid pressure values", async () => {
      const invalidData = {
        userId: "1",
        systolic: 100,
        diastolic: 120, // Diastolic higher than systolic
      };

      await expect(
        measurementUseCase.createPressureMeasurement(invalidData)
      ).rejects.toThrow("Diastolic pressure cannot be higher than systolic");
    });

    it("should throw error for negative pressure values", async () => {
      const invalidData = {
        userId: "1",
        systolic: -50,
        diastolic: 80,
      };

      await expect(
        measurementUseCase.createPressureMeasurement(invalidData)
      ).rejects.toThrow("Systolic pressure must be positive");
    });
  });

  describe("Measurement Retrieval", () => {
    it("should get glucose measurements for user", async () => {
      const measurements = [
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

      mockGlucoseRepository.findByUserId = vi
        .fn()
        .mockResolvedValue(measurements);

      const result = await measurementUseCase.getGlucoseMeasurements("1");

      expect(mockGlucoseRepository.findByUserId).toHaveBeenCalledWith("1");
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(95);
      expect(result[1].value).toBe(120);
    });

    it("should get pressure measurements for user", async () => {
      const measurements = [
        new PressureMeasurement({
          id: "1",
          userId: "1",
          timestamp: new Date("2024-01-15T08:00:00Z"),
          systolic: 120,
          diastolic: 80,
          status: "normal",
        }),
      ];

      mockPressureRepository.findByUserId = vi
        .fn()
        .mockResolvedValue(measurements);

      const result = await measurementUseCase.getPressureMeasurements("1");

      expect(mockPressureRepository.findByUserId).toHaveBeenCalledWith("1");
      expect(result).toHaveLength(1);
      expect(result[0].systolic).toBe(120);
      expect(result[0].diastolic).toBe(80);
    });

    it("should get measurements by date range", async () => {
      const startDate = new Date("2024-01-15T00:00:00Z");
      const endDate = new Date("2024-01-15T23:59:59Z");

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

      mockGlucoseRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(glucoseMeasurements);
      mockPressureRepository.findByUserIdAndDate = vi
        .fn()
        .mockResolvedValue(pressureMeasurements);

      const result = await measurementUseCase.getMeasurementsByDateRange(
        "1",
        startDate,
        endDate
      );

      expect(mockGlucoseRepository.findByUserIdAndDate).toHaveBeenCalledWith(
        "1",
        startDate,
        endDate
      );
      expect(mockPressureRepository.findByUserIdAndDate).toHaveBeenCalledWith(
        "1",
        startDate,
        endDate
      );
      expect(result.glucoseMeasurements).toHaveLength(1);
      expect(result.pressureMeasurements).toHaveLength(1);
    });
  });

  describe("Measurement Updates", () => {
    it("should update glucose measurement successfully", async () => {
      const existingMeasurement = new GlucoseMeasurement({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        value: 95,
        context: "fasting",
        status: "normal",
      });

      const updateData = { value: 110 };

      mockGlucoseRepository.findById = vi
        .fn()
        .mockResolvedValue(existingMeasurement);
      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockGlucoseRepository.update = vi.fn().mockResolvedValue({
        ...existingMeasurement,
        value: 110,
        status: "warning",
      });

      const result = await measurementUseCase.updateGlucoseMeasurement(
        "1",
        updateData
      );

      expect(mockGlucoseRepository.findById).toHaveBeenCalledWith("1");
      expect(mockGlucoseRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining(updateData)
      );
      expect(result.value).toBe(110);
      expect(result.status).toBe("warning");
    });

    it("should update pressure measurement successfully", async () => {
      const existingMeasurement = new PressureMeasurement({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        systolic: 120,
        diastolic: 80,
        status: "normal",
      });

      const updateData = { systolic: 130, diastolic: 85 };

      mockPressureRepository.findById = vi
        .fn()
        .mockResolvedValue(existingMeasurement);
      mockUserProfileRepository.findById = vi
        .fn()
        .mockResolvedValue(testUserProfile);
      mockPressureRepository.update = vi.fn().mockResolvedValue({
        ...existingMeasurement,
        systolic: 130,
        diastolic: 85,
        status: "warning",
      });

      const result = await measurementUseCase.updatePressureMeasurement(
        "1",
        updateData
      );

      expect(mockPressureRepository.findById).toHaveBeenCalledWith("1");
      expect(mockPressureRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining(updateData)
      );
      expect(result.systolic).toBe(130);
      expect(result.diastolic).toBe(85);
      expect(result.status).toBe("warning");
    });
  });

  describe("Measurement Deletion", () => {
    it("should delete glucose measurement successfully", async () => {
      const existingMeasurement = new GlucoseMeasurement({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        value: 95,
        context: "fasting",
        status: "normal",
      });

      mockGlucoseRepository.findById = vi
        .fn()
        .mockResolvedValue(existingMeasurement);
      mockGlucoseRepository.delete = vi.fn().mockResolvedValue(true);

      const result = await measurementUseCase.deleteGlucoseMeasurement("1");

      expect(mockGlucoseRepository.findById).toHaveBeenCalledWith("1");
      expect(mockGlucoseRepository.delete).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });

    it("should delete pressure measurement successfully", async () => {
      const existingMeasurement = new PressureMeasurement({
        id: "1",
        userId: "1",
        timestamp: new Date("2024-01-15T08:00:00Z"),
        systolic: 120,
        diastolic: 80,
        status: "normal",
      });

      mockPressureRepository.findById = vi
        .fn()
        .mockResolvedValue(existingMeasurement);
      mockPressureRepository.delete = vi.fn().mockResolvedValue(true);

      const result = await measurementUseCase.deletePressureMeasurement("1");

      expect(mockPressureRepository.findById).toHaveBeenCalledWith("1");
      expect(mockPressureRepository.delete).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });
  });

  describe("Measurement Statistics", () => {
    it("should calculate glucose statistics for user", async () => {
      const measurements = [
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

      mockGlucoseRepository.findByUserId = vi
        .fn()
        .mockResolvedValue(measurements);

      const stats = await measurementUseCase.getGlucoseStatistics("1");

      expect(stats.totalMeasurements).toBe(3);
      expect(stats.averageValue).toBeCloseTo(121.67, 1);
      expect(stats.normalCount).toBe(1);
      expect(stats.warningCount).toBe(1);
      expect(stats.criticalCount).toBe(1);
    });

    it("should calculate pressure statistics for user", async () => {
      const measurements = [
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

      mockPressureRepository.findByUserId = vi
        .fn()
        .mockResolvedValue(measurements);

      const stats = await measurementUseCase.getPressureStatistics("1");

      expect(stats.totalMeasurements).toBe(2);
      expect(stats.averageSystolic).toBe(127.5);
      expect(stats.averageDiastolic).toBe(82.5);
      expect(stats.normalCount).toBe(1);
      expect(stats.warningCount).toBe(1);
    });
  });
});
