import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MedicalView } from '@/domain/MedicalView';
import { MedicalViewUseCase } from '@/use-cases/MedicalViewUseCase';
import { InMemoryMedicalViewRepository } from '@/repositories/implementations/InMemoryMedicalViewRepository';
import { InMemoryGlucoseMeasurementRepository } from '@/repositories/implementations/InMemoryGlucoseMeasurementRepository';
import { InMemoryPressureMeasurementRepository } from '@/repositories/implementations/InMemoryPressureMeasurementRepository';
import { InMemoryFoodEntryRepository } from '@/repositories/implementations/InMemoryFoodEntryRepository';
import { InMemoryUserProfileRepository } from '@/repositories/implementations/InMemoryUserProfileRepository';

// Simulamos una instancia del caso de uso
const medicalViewRepository = new InMemoryMedicalViewRepository();
const glucoseRepository = new InMemoryGlucoseMeasurementRepository();
const pressureRepository = new InMemoryPressureMeasurementRepository();
const foodRepository = new InMemoryFoodEntryRepository();
const userProfileRepository = new InMemoryUserProfileRepository();

const medicalViewUseCase = new MedicalViewUseCase(
  medicalViewRepository,
  glucoseRepository,
  pressureRepository,
  foodRepository,
  userProfileRepository
);

export const useMedicalView = (viewId: string) => {
  return useQuery({
    queryKey: ['medicalView', viewId],
    queryFn: () => medicalViewUseCase.getMedicalView(viewId),
    enabled: !!viewId,
  });
};

export const useMedicalViewsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['medicalViews', userId],
    queryFn: () => medicalViewUseCase.getMedicalViewsByUser(userId),
    enabled: !!userId,
  });
};

export const useMedicalViewByDate = (userId: string, date: Date) => {
  return useQuery({
    queryKey: ['medicalView', userId, date.toISOString()],
    queryFn: () => medicalViewUseCase.getMedicalViewByDate(userId, date),
    enabled: !!userId && !!date,
  });
};

export const useCreateMedicalView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; date: Date }) => 
      medicalViewUseCase.generateMedicalView(data),
    onSuccess: (newView) => {
      queryClient.setQueryData(['medicalView', newView.id], newView);
      queryClient.invalidateQueries({ 
        queryKey: ['medicalViews', newView.userId] 
      });
    },
  });
};

export const useUpdateMedicalView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MedicalView>;
    }) => medicalViewUseCase.updateMedicalView(id, updates),
    onSuccess: (updatedView) => {
      queryClient.setQueryData(['medicalView', updatedView.id], updatedView);
      queryClient.invalidateQueries({ 
        queryKey: ['medicalViews', updatedView.userId] 
      });
    },
  });
};

export const useHealthSummary = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['healthSummary', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => medicalViewUseCase.getHealthSummary(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};

export const useTrendsAnalysis = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['trendsAnalysis', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => medicalViewUseCase.getTrendsAnalysis(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};

export const useMedicalReport = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['medicalReport', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => medicalViewUseCase.generateMedicalReport(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};

export const useExportMedicalReport = () => {
  return useMutation({
    mutationFn: ({
      userId,
      startDate,
      endDate,
      format = 'json',
    }: {
      userId: string;
      startDate: Date;
      endDate: Date;
      format?: 'pdf' | 'json';
    }) => medicalViewUseCase.exportMedicalReport(userId, startDate, endDate, format),
  });
};
