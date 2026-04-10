export interface IngredientResponse {
  id: number;
  name: string;
  description: string | null;
  unitOfMeasure: string;
  stockQuantity: number;
  minimumStock: number;
  isLowStock: boolean;
  createdAt: string;
  isActive: boolean;
}

export interface CreateIngredientRequest {
  name: string;
  description?: string | null;
  unitOfMeasure: string;
  stockQuantity: number;
  minimumStock: number;
}

export type UpdateIngredientRequest = CreateIngredientRequest;
