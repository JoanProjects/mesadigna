import { httpGet } from '@/services/http/client';
import type { PagedResponse } from '@/services/http/types';
import type {
  DailyKitchenSummary,
  DietCategoryBeneficiary,
  DietarySummary,
  IngredientsSummary,
  DailyOperationalSummary,
} from '../types/kitchen.types';

const BASE = '/kitchen';

export const kitchenService = {
  getDailySummary(date: string) {
    return httpGet<DailyKitchenSummary>(`${BASE}/daily-summary`, { date });
  },

  getBeneficiariesByCategory(date: string, categoryKey: string, page = 1, pageSize = 10) {
    return httpGet<PagedResponse<DietCategoryBeneficiary>>(
      `${BASE}/diet-category/${encodeURIComponent(categoryKey)}/beneficiaries`,
      { date, page, pageSize },
    );
  },

  },

  getIngredientsSummary() {
    return httpGet<IngredientsSummary>(`${BASE}/ingredients-summary`);
  },

  getOperationalSummary(date: string) {
    return httpGet<DailyOperationalSummary>(`${BASE}/daily-operational-summary`, { date });
  },
};
