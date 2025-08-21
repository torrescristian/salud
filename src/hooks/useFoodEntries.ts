import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FoodEntry } from '@/domain/FoodEntry';
import { FoodEntryUseCase } from '@/use-cases/FoodEntryUseCase';
import { InMemoryFoodEntryRepository } from '@/repositories/implementations/InMemoryFoodEntryRepository';

// Simulamos una instancia del caso de uso
const foodRepository = new InMemoryFoodEntryRepository();
const foodEntryUseCase = new FoodEntryUseCase(foodRepository);

export const useFoodEntries = (userId: string) => {
  return useQuery({
    queryKey: ['foodEntries', userId],
    queryFn: () => foodEntryUseCase.getFoodEntriesByUser(userId),
    enabled: !!userId,
  });
};

export const useFoodEntry = (entryId: string) => {
  return useQuery({
    queryKey: ['foodEntry', entryId],
    queryFn: () => foodEntryUseCase.getFoodEntry(entryId),
    enabled: !!entryId,
  });
};

export const useCreateFoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryData: {
      userId: string;
      foodType: 'carbohydrates' | 'proteins' | 'vegetables' | 'eggs' | 'dairy';
      description: string;
      quantity: number;
      emoji: string;
      notes?: string;
    }) => foodEntryUseCase.addFoodEntry(entryData),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ 
        queryKey: ['foodEntries', newEntry.userId] 
      });
      queryClient.setQueryData(
        ['foodEntry', newEntry.id], 
        newEntry
      );
    },
  });
};

export const useUpdateFoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<FoodEntry>;
    }) => foodEntryUseCase.updateFoodEntry(id, updates),
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(
        ['foodEntry', updatedEntry.id], 
        updatedEntry
      );
      queryClient.invalidateQueries({ 
        queryKey: ['foodEntries', updatedEntry.userId] 
      });
    },
  });
};

export const useDeleteFoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => 
      foodEntryUseCase.deleteFoodEntry(entryId),
    onSuccess: (_, entryId) => {
      queryClient.removeQueries({ queryKey: ['foodEntry', entryId] });
      queryClient.invalidateQueries({ queryKey: ['foodEntries'] });
    },
  });
};

export const useNutritionalAnalysis = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['nutritionalAnalysis', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => foodEntryUseCase.getNutritionalSummary(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
};

export const useWeeklyNutritionalTrends = (userId: string, date: Date) => {
  return useQuery({
    queryKey: ['weeklyNutritionalTrends', userId, date.toISOString()],
    queryFn: () => foodEntryUseCase.getWeeklyNutritionalTrends(userId, date),
    enabled: !!userId && !!date,
  });
};
