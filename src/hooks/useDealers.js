import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrand, createDealer, createHub, listBrands, listDealers, listHubs } from '../api/dealers';

export const useBrands = (params = {}, options = {}) =>
  useQuery({ queryKey: ['brands', params], queryFn: () => listBrands(params), ...options });

export const useDealers = (params = {}, options = {}) =>
  useQuery({ queryKey: ['dealers', params], queryFn: () => listDealers(params), ...options });

export const useHubs = (params = {}, options = {}) =>
  useQuery({ queryKey: ['hubs', params], queryFn: () => listHubs(params), ...options });

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createBrand, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }) });
};

export const useCreateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createDealer, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dealers'] }) });
};

export const useCreateHub = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createHub, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hubs'] }) });
};
