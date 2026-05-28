import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrand, createDealer, createHub, listBrands, listDealers, listHubs } from '../api/dealers';

export const useBrands = (params = {}) =>
  useQuery({ queryKey: ['brands', params], queryFn: () => listBrands(params) });

export const useDealers = (params = {}) =>
  useQuery({ queryKey: ['dealers', params], queryFn: () => listDealers(params) });

export const useHubs = (params = {}) =>
  useQuery({ queryKey: ['hubs', params], queryFn: () => listHubs(params) });

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
