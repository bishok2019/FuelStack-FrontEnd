import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInventory, deleteInventory, listInventory, updateInventory } from '../api/inventory';

export const useInventory = (params = {}) =>
  useQuery({ queryKey: ['inventory', params], queryFn: () => listInventory(params) });

export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInventory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @param {{ id: string | number, payload: Record<string, unknown> }} variables */
    mutationFn: ({ id, payload }) => updateInventory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  });
};
