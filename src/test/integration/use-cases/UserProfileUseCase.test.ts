import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserProfileUseCase } from "../../../use-cases/UserProfileUseCase";
import { UserProfileRepository } from "../../../domain/repositories/UserProfileRepository";
import { UserProfile } from "../../../domain/UserProfile";

describe("UserProfileUseCase Integration Tests", () => {
  let userProfileUseCase: UserProfileUseCase;
  let mockRepository: UserProfileRepository;
  let testUserProfile: UserProfile;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };

    userProfileUseCase = new UserProfileUseCase(mockRepository);

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

  describe("Create User Profile", () => {
    it("should create a new user profile successfully", async () => {
      const createData = {
        name: "María García",
        birthDate: new Date("1985-05-15"),
        weight: 65,
        height: 165,
        medicalConditions: ["hypertension"],
      };

      mockRepository.save = vi.fn().mockResolvedValue({
        id: "2",
        ...createData,
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

      const result = await userProfileUseCase.createProfile(createData);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createData)
      );
      expect(result.id).toBe("2");
      expect(result.name).toBe("María García");
      expect(result.medicalConditions).toContain("hypertension");
    });

    it("should calculate default limits based on user data", async () => {
      const createData = {
        name: "Carlos López",
        birthDate: new Date("1975-03-20"),
        weight: 85,
        height: 175,
        medicalConditions: [],
      };

      mockRepository.save = vi.fn().mockResolvedValue({
        id: "3",
        ...createData,
        glucoseLimits: {
          fasting: { min: 75, max: 115 },
          postPrandial: { min: 105, max: 155 },
          custom: [],
        },
        pressureLimits: {
          systolic: { min: 115, max: 130 },
          diastolic: { min: 75, max: 85 },
        },
        measurementFrequency: {
          glucose: 3,
          pressure: 2,
        },
      });

      const result = await userProfileUseCase.createProfile(createData);

      expect(result.glucoseLimits.fasting.min).toBeGreaterThan(70);
      expect(result.glucoseLimits.fasting.max).toBeGreaterThan(100);
      expect(result.pressureLimits.systolic.min).toBeGreaterThan(110);
      expect(result.pressureLimits.systolic.max).toBeGreaterThan(120);
    });

    it("should throw error for invalid user data", async () => {
      const invalidData = {
        name: "",
        birthDate: new Date("1980-01-01"),
        weight: -5,
        height: 170,
        medicalConditions: [],
      };

      await expect(
        userProfileUseCase.createProfile(invalidData)
      ).rejects.toThrow("Invalid user data provided");
    });
  });

  describe("Update User Profile", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        weight: 75,
        height: 172,
        glucoseLimits: {
          fasting: { min: 80, max: 110 },
          postPrandial: { min: 110, max: 150 },
          custom: [],
        },
      };

      mockRepository.findById = vi.fn().mockResolvedValue(testUserProfile);
      mockRepository.update = vi.fn().mockResolvedValue({
        ...testUserProfile,
        ...updateData,
      });

      const result = await userProfileUseCase.updateProfile("1", updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(mockRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining(updateData)
      );
      expect(result.weight).toBe(75);
      expect(result.height).toBe(172);
      expect(result.glucoseLimits.fasting.min).toBe(80);
    });

    it("should throw error when profile not found", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(
        userProfileUseCase.updateProfile("999", { weight: 75 })
      ).rejects.toThrow("User profile not found");
    });

    it("should validate updated values", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(testUserProfile);

      const invalidUpdate = { weight: -10 };

      await expect(
        userProfileUseCase.updateProfile("1", invalidUpdate)
      ).rejects.toThrow("Weight must be positive");
    });
  });

  describe("Get User Profile", () => {
    it("should retrieve user profile by ID", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(testUserProfile);

      const result = await userProfileUseCase.getProfile("1");

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(result).toEqual(testUserProfile);
      expect(result.name).toBe("Juan Pérez");
      expect(result.medicalConditions).toContain("diabetes");
    });

    it("should throw error when profile not found", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(userProfileUseCase.getProfile("999")).rejects.toThrow(
        "User profile not found"
      );
    });
  });

  describe("Delete User Profile", () => {
    it("should delete user profile successfully", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(testUserProfile);
      mockRepository.delete = vi.fn().mockResolvedValue(true);

      const result = await userProfileUseCase.deleteProfile("1");

      expect(mockRepository.findById).toHaveBeenCalledWith("1");
      expect(mockRepository.delete).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });

    it("should throw error when profile not found for deletion", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(userProfileUseCase.deleteProfile("999")).rejects.toThrow(
        "User profile not found"
      );
    });
  });

  describe("List All Profiles", () => {
    it("should retrieve all user profiles", async () => {
      const profiles = [
        testUserProfile,
        {
          id: "2",
          name: "María García",
          birthDate: new Date("1985-05-15"),
          weight: 65,
          height: 165,
          medicalConditions: ["hypertension"],
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
        },
      ];

      mockRepository.findAll = vi.fn().mockResolvedValue(profiles);

      const result = await userProfileUseCase.getAllProfiles();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Juan Pérez");
      expect(result[1].name).toBe("María García");
    });

    it("should return empty array when no profiles exist", async () => {
      mockRepository.findAll = vi.fn().mockResolvedValue([]);

      const result = await userProfileUseCase.getAllProfiles();

      expect(result).toHaveLength(0);
    });
  });

  describe("Profile Validation", () => {
    it("should validate complete profile data", async () => {
      const validData = {
        name: "Test User",
        birthDate: new Date("1990-01-01"),
        weight: 70,
        height: 170,
        medicalConditions: [],
      };

      const isValid = userProfileUseCase.validateProfileData(validData);
      expect(isValid).toBe(true);
    });

    it("should reject incomplete profile data", async () => {
      const invalidData = {
        name: "Test User",
        birthDate: new Date("1990-01-01"),
        weight: 70,
        // Missing height and medicalConditions
      };

      const isValid = userProfileUseCase.validateProfileData(invalidData);
      expect(isValid).toBe(false);
    });
  });

  describe("Health Metrics Calculation", () => {
    it("should calculate BMI for user profile", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(testUserProfile);

      const bmi = await userProfileUseCase.calculateBMI("1");

      expect(bmi).toBeCloseTo(24.22, 2);
    });

    it("should calculate age for user profile", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(testUserProfile);

      const age = await userProfileUseCase.calculateAge("1");

      expect(age).toBeGreaterThan(40);
    });

    it("should throw error when calculating metrics for non-existent profile", async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(userProfileUseCase.calculateBMI("999")).rejects.toThrow(
        "User profile not found"
      );
    });
  });
});
