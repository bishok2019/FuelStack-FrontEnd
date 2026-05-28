import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, listUsers, retrieveUser, updateUser } from '../api/users';

export const useUsers = (params = {}) =>
  useQuery({ queryKey: ['users', params], queryFn: () => listUsers(params) });

export const useUser = (id) =>
  useQuery({ queryKey: ['users', id], queryFn: () => retrieveUser(id), enabled: Boolean(id) });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @param {{ id: string | number, payload: Record<string, unknown> }} variables */
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};
