import { httpGet, httpPost, httpPut, httpDelete } from '@/services/http/client';
import type { ApiResponse, PagedResponse } from '@/services/http/types';
import type { MealResponse, CreateMealRequest, UpdateMealRequest, AddMealIngredientRequest } from '../types/meal.types';

const BASE = '/meals';

export const mealService = {
  getAll(page: number, pageSize: number, search?: string) {
    return httpGet<PagedResponse<MealResponse>>(BASE, {
      page,
      pageSize,
      ...(search ? { search } : {}),
    });
  },

  getById(id: number) {
    return httpGet<MealResponse>(`${BASE}/${id}`);
  },

  create(data: CreateMealRequest) {
    return httpPost<MealResponse>(BASE, data);
  },

  update(id: number, data: UpdateMealRequest) {
    return httpPut<MealResponse>(`${BASE}/${id}`, data);
  },

  addIngredient(mealId: number, data: AddMealIngredientRequest) {
    return httpPost<MealResponse>(`${BASE}/${mealId}/ingredients`, data);
  },

  removeIngredient(mealId: number, ingredientId: number): Promise<ApiResponse<object>> {
    return httpDelete(`${BASE}/${mealId}/ingredients/${ingredientId}`);
  },
};
