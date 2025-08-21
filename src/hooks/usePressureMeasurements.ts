import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PressureMeasurement } from '@/domain/PressureMeasurement';
import { MeasurementUseCase } from '@/use-cases/MeasurementUseCase';
import { InMemoryGlucoseMeasurementRepository } from '@/repositories/implementations/InMemoryGlucoseMeasurementRepository';
import { InMemoryPressureMeasurementRepository } from '@/repositories/implementations/InMemoryPressureMeasurementRepository';

// Simulamos una instancia del caso de uso
const glucoseRepository = new InMemoryGlucoseMeasurementRepository();
const pressureRepository = new InMemoryPressureMeasurementRepository();
const measurementUseCase = new MeasurementUseCase(glucoseRepository, pressureRepository);

export const usePressureMeasurements = (userId: string) => {
  return useQuery({
    queryKey: ['pressureMeasurements', userId],
    queryFn: () => measurementUseCase.getPressureMeasurementsByUser(userId),
    enabled: !!userId,
  });
};

export const usePressureMeasurement = (measurementId: string) => {
  return useQuery({
    queryKey: ['pressureMeasurement', measurementId],
    queryFn: () => measurementUseCase.getPressureMeasurement(measurementId),
    enabled: !!measurementId,
  });
};

export const useCreatePressureMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (measurementData: {
      userId: string;
      systolic: number;
      diastolic: number;
      notes?: string;
    }) => measurementUseCase.addPressureMeasurement(measurementData),
    onSuccess: (newMeasurement) => {
      queryClient.invalidateQueries({ 
        queryKey: ['pressureMeasurements', newMeasurement.userId] 
      });
      queryClient.setQueryData(
        ['pressureMeasurement', newMeasurement.id], 
        newMeasurement
      );
    },
  });
};

export const useUpdatePressureMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PressureMeasurement>;
    }) => measurementUseCase.updatePressureMeasurement(id, updates),
    onSuccess: (updatedMeasurement) => {
      queryClient.setQueryData(
        ['pressureMeasurement', updatedMeasurement.id], 
        updatedMeasurement
      );
      queryClient.invalidateQueries({ 
        queryKey: ['pressureMeasurements', updatedMeasurement.userId] 
      });
    },
  });
};

export const useDeletePressureMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (measurementId: string) => 
      measurementUseCase.deletePressureMeasurement(measurementId),
    onSuccess: (_, measurementId) => {
      queryClient.removeQueries({ queryKey: ['pressureMeasurement', measurementId] });
      queryClient.invalidateQueries({ queryKey: ['pressureMeasurements'] });
    },
  });
};

export const usePressureAnalysis = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['pressureAnalysis', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => measurementUseCase.analyzePressureTrend(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};
