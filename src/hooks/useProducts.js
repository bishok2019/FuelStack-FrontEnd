import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  createProductCategory,
  listProductCategories,
  listProducts,
  updateProduct,
} from '../api/products';

export const useProducts = (params = {}) =>
  useQuery({ queryKey: ['products', params], queryFn: () => listProducts(params) });

export const useProductCategories = (params = {}) =>
  useQuery({ queryKey: ['product-categories', params], queryFn: () => listProductCategories(params) });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @param {{ id: string | number, payload: Record<string, unknown> }} variables */
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['product-categories'] }),
  });
};
