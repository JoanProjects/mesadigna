import type { PagedResponse } from '@/services/http/types';

export interface DailyKitchenSummary {
  date: string;
  totalServings: number;
  regularServings: number;
  specialDietServings: number;
  dietCategories: DietCategoryCount[];
}

export interface DietCategoryCount {
  category: string;
  categoryKey: string;
  count: number;
}

export interface DietCategoryBeneficiary {
  beneficiaryId: number;
  fullName: string;
  internalCode: string;
}

export interface DietarySummary {
  totalBeneficiariesWithRestrictions: number;
  beneficiaries: PagedResponse<DietaryBeneficiary>;
}

export interface DietarySummaryFilter {
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export type DateRangePreset = 'all' | 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'custom';

export interface DietaryBeneficiary {
  beneficiaryId: number;
  fullName: string;
  internalCode: string;
  dietaryRestrictions: string | null;
  allergies: string | null;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  specialConditions: string;
}

export interface IngredientsSummary {
  totalIngredients: number;
  lowStockCount: number;
  lowStockItems: LowStockIngredient[];
}

export interface LowStockIngredient {
  id: number;
  name: string;
  currentStock: number;
  minimumStock: number;
  unitOfMeasure: string;
}

export interface DailyOperationalSummary {
  date: string;
  totalAttendees: number;
  totalServingsPlanned: number;
  totalPreparations: number;
  preparations: PreparationSummaryItem[];
  ingredientRequirements: IngredientRequirement[];
}

export interface PreparationSummaryItem {
  mealName: string;
  dietType: string;
  estimatedServings: number;
  status: string;
}

export interface IngredientRequirement {
  ingredientId: number;
  ingredientName: string;
  totalQuantityRequired: number;
  unitOfMeasure: string;
  currentStock: number;
  isSufficient: boolean;
}