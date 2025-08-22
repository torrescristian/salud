import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthService } from "../services/healthService";
import {
  UserProfile,
  UserMedication,
  GlucoseMeasurement,
  PressureMeasurement,
  InsulinEntry,
} from "../types/health";

// Query Keys
export const queryKeys = {
  userProfile: ["userProfile"],
  medications: ["medications"],
  glucoseMeasurements: ["glucoseMeasurements"],
  pressureMeasurements: ["pressureMeasurements"],
  insulinEntries: ["insulinEntries"],
  todayEntries: ["todayEntries"],
  medicationSuggestions: (query: string) => ["medicationSuggestions", query],
} as const;

// User Profile Queries
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: () => healthService.getUserProfile(),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      healthService.saveUserProfile(profile);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    },
  });
}

// Medication Queries
export function useMedications() {
  return useQuery({
    queryKey: queryKeys.medications,
    queryFn: () => healthService.getMedications(),
  });
}

export function useAddMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      withFood,
      customDate,
    }: {
      name: string;
      withFood: "before" | "during" | "after" | "none";
      customDate?: Date;
    }) => healthService.addMedication(name, withFood, customDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UserMedication>;
    }) => {
      healthService.updateMedication(id, updates);
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      healthService.deleteMedication(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medications });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useMedicationSuggestions(query: string) {
  return useQuery({
    queryKey: queryKeys.medicationSuggestions(query),
    queryFn: () => healthService.getMedicationSuggestions(query),
    enabled: query.length > 0,
  });
}

// Glucose Measurement Queries
export function useGlucoseMeasurements() {
  return useQuery({
    queryKey: queryKeys.glucoseMeasurements,
    queryFn: () => healthService.getGlucoseMeasurements(),
  });
}

export function useAddGlucoseMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      value,
      context,
      customDate,
    }: {
      value: number;
      context: "fasting" | "postprandial" | "custom";
      customDate?: Date;
    }) => healthService.addGlucoseMeasurement(value, context, customDate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.glucoseMeasurements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useUpdateGlucoseMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GlucoseMeasurement>;
    }) => {
      healthService.updateGlucoseMeasurement(id, updates);
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.glucoseMeasurements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useDeleteGlucoseMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      healthService.deleteGlucoseMeasurement(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.glucoseMeasurements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

// Pressure Measurement Queries
export function usePressureMeasurements() {
  return useQuery({
    queryKey: queryKeys.pressureMeasurements,
    queryFn: () => healthService.getPressureMeasurements(),
  });
}

export function useAddPressureMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      systolic,
      diastolic,
      customDate,
    }: {
      systolic: number;
      diastolic: number;
      customDate?: Date;
    }) => healthService.addPressureMeasurement(systolic, diastolic, customDate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pressureMeasurements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useUpdatePressureMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PressureMeasurement>;
    }) => {
      healthService.updatePressureMeasurement(id, updates);
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pressureMeasurements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useDeletePressureMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      healthService.deletePressureMeasurement(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pressureMeasurements,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

// Insulin Entry Queries
export function useInsulinEntries() {
  return useQuery({
    queryKey: queryKeys.insulinEntries,
    queryFn: () => healthService.getInsulinEntries(),
  });
}

export function useAddInsulinEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dose,
      type,
      context,
      notes,
      customDate,
    }: {
      dose: number;
      type: "rapid" | "long" | "mixed";
      context: "fasting" | "postprandial" | "correction";
      notes?: string;
      customDate?: Date;
    }) => healthService.addInsulinEntry(dose, type, context, notes, customDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insulinEntries });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useUpdateInsulinEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<InsulinEntry>;
    }) => {
      healthService.updateInsulinEntry(id, updates);
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insulinEntries });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

export function useDeleteInsulinEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      healthService.deleteInsulinEntry(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insulinEntries });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntries });
    },
  });
}

// Today Entries Query
export function useTodayEntries() {
  return useQuery({
    queryKey: queryKeys.todayEntries,
    queryFn: () => healthService.getTodayEntries(),
  });
}
