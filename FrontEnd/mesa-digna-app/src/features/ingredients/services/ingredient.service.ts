import { httpGet, httpPost, httpPut } from '@/services/http/client';
import type { ApiResponse, PagedResponse } from '@/services/http/types';
import type { IngredientResponse, CreateIngredientRequest, UpdateIngredientRequest } from '../types/ingredient.types';

const BASE = '/ingredients';

export const ingredientService = {
  getAll(page: number, pageSize: number, search?: string) {
    return httpGet<PagedResponse<IngredientResponse>>(BASE, {
      page,
      pageSize,
      ...(search ? { search } : {}),
    });
  },

  getById(id: number) {
    return httpGet<IngredientResponse>(`${BASE}/${id}`);
  },

  create(data: CreateIngredientRequest) {
    return httpPost<IngredientResponse>(BASE, data);
  },

  update(id: number, data: UpdateIngredientRequest) {
    return httpPut<IngredientResponse>(`${BASE}/${id}`, data);
  },

  deactivate(id: number): Promise<ApiResponse<object>> {
    return httpPut(`${BASE}/${id}/change-status`);
  },
};
