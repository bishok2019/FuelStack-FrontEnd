import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomer, listCustomers, retrieveCustomer } from '../api/customers';

export const useCustomers = (params = {}) =>
  useQuery({ queryKey: ['customers', params], queryFn: () => listCustomers(params) });

export const useCustomer = (id) =>
  useQuery({ queryKey: ['customers', id], queryFn: () => retrieveCustomer(id), enabled: Boolean(id) });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createCustomer, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }) });
};
