import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/domain/UserProfile';
import { UserProfileUseCase } from '@/use-cases/UserProfileUseCase';
import { InMemoryUserProfileRepository } from '@/repositories/implementations/InMemoryUserProfileRepository';

// Simulamos una instancia del caso de uso
// En una app real, esto vendría de un container de inyección de dependencias
const userProfileRepository = new InMemoryUserProfileRepository();
const userProfileUseCase = new UserProfileUseCase(userProfileRepository);

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userProfileUseCase.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: {
      name: string;
      email: string;
      dateOfBirth: Date;
      medicalConditions: string[];
    }) => userProfileUseCase.createUserProfile(userData),
    onSuccess: (newProfile) => {
      queryClient.setQueryData(['userProfile', newProfile.id], newProfile);
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UserProfile>;
    }) => userProfileUseCase.updateUserProfile(id, updates),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile', updatedProfile.id], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
};

export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userProfileUseCase.deleteUserProfile(userId),
    onSuccess: (_, userId) => {
      queryClient.removeQueries({ queryKey: ['userProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
};
