import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPaymentMethod, listPaymentMethods } from '../api/paymentMethods';

export const usePaymentMethods = (params = {}) =>
  useQuery({ queryKey: ['payment-methods', params], queryFn: () => listPaymentMethods(params) });

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
};
