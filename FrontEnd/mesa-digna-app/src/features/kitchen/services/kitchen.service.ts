import { httpGet } from '@/services/http/client';
import type { PagedResponse } from '@/services/http/types';
import type {
  DailyKitchenSummary,
  DietCategoryBeneficiary,
  DietarySummary,
  DietarySummaryFilter,
  IngredientsSummary,
  DailyOperationalSummary,
} from '../types/kitchen.types';

const BASE = '/kitchen';

export const kitchenService = {
  getDailySummary(date: string) {
    return httpGet<DailyKitchenSummary>(`${BASE}/daily-summary`, { date });
  },

  getBeneficiariesByCategory(date: string, categoryKey: string, page = 1, pageSize = 50) {
    return httpGet<PagedResponse<DietCategoryBeneficiary>>(
      `${BASE}/diet-category/${encodeURIComponent(categoryKey)}/beneficiaries`,
      { date, page, pageSize },
    );
  },

  getDietarySummary(filter: DietarySummaryFilter) {
    return httpGet<DietarySummary>(`${BASE}/dietary-summary`, {
      page: filter.page,
      pageSize: filter.pageSize,
      ...(filter.startDate ? { startDate: filter.startDate } : {}),
      ...(filter.endDate ? { endDate: filter.endDate } : {}),
      ...(filter.search ? { search: filter.search } : {}),
    });
  },

  getIngredientsSummary() {
    return httpGet<IngredientsSummary>(`${BASE}/ingredients-summary`);
  },

  getOperationalSummary(date: string) {
    return httpGet<DailyOperationalSummary>(`${BASE}/daily-operational-summary`, { date });
  },
};
