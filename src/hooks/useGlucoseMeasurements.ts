import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlucoseMeasurement } from '@/domain/GlucoseMeasurement';
import { MeasurementUseCase } from '@/use-cases/MeasurementUseCase';
import { InMemoryGlucoseMeasurementRepository } from '@/repositories/implementations/InMemoryGlucoseMeasurementRepository';
import { InMemoryPressureMeasurementRepository } from '@/repositories/implementations/InMemoryPressureMeasurementRepository';

// Simulamos una instancia del caso de uso
const glucoseRepository = new InMemoryGlucoseMeasurementRepository();
const pressureRepository = new InMemoryPressureMeasurementRepository();
const measurementUseCase = new MeasurementUseCase(glucoseRepository, pressureRepository);

export const useGlucoseMeasurements = (userId: string) => {
  return useQuery({
    queryKey: ['glucoseMeasurements', userId],
    queryFn: () => measurementUseCase.getGlucoseMeasurementsByUser(userId),
    enabled: !!userId,
  });
};

export const useGlucoseMeasurement = (measurementId: string) => {
  return useQuery({
    queryKey: ['glucoseMeasurement', measurementId],
    queryFn: () => measurementUseCase.getGlucoseMeasurement(measurementId),
    enabled: !!measurementId,
  });
};

export const useCreateGlucoseMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (measurementData: {
      userId: string;
      value: number;
      context: 'fasting' | 'postPrandial' | 'custom';
      notes?: string;
    }) => measurementUseCase.addGlucoseMeasurement(measurementData),
    onSuccess: (newMeasurement) => {
      queryClient.invalidateQueries({ 
        queryKey: ['glucoseMeasurements', newMeasurement.userId] 
      });
      queryClient.setQueryData(
        ['glucoseMeasurement', newMeasurement.id], 
        newMeasurement
      );
    },
  });
};

export const useUpdateGlucoseMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GlucoseMeasurement>;
    }) => measurementUseCase.updateGlucoseMeasurement(id, updates),
    onSuccess: (updatedMeasurement) => {
      queryClient.setQueryData(
        ['glucoseMeasurement', updatedMeasurement.id], 
        updatedMeasurement
      );
      queryClient.invalidateQueries({ 
        queryKey: ['glucoseMeasurements', updatedMeasurement.userId] 
      });
    },
  });
};

export const useDeleteGlucoseMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (measurementId: string) => 
      measurementUseCase.deleteGlucoseMeasurement(measurementId),
    onSuccess: (_, measurementId) => {
      queryClient.removeQueries({ queryKey: ['glucoseMeasurement', measurementId] });
      queryClient.invalidateQueries({ queryKey: ['glucoseMeasurements'] });
    },
  });
};

export const useGlucoseAnalysis = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['glucoseAnalysis', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => measurementUseCase.analyzeGlucoseTrend(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};
