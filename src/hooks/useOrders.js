import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, listOrders, retrieveOrder } from '../api/orders';

export const useOrders = (params = {}) =>
  useQuery({ queryKey: ['orders', params], queryFn: () => listOrders(params) });

export const useOrder = (id) =>
  useQuery({ queryKey: ['orders', id], queryFn: () => retrieveOrder(id), enabled: Boolean(id) });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
};
