export interface MealResponse {
  id: number;
  name: string;
  description: string | null;
  mealType: string;
  baseServings: number;
  createdAt: string;
  ingredients: MealIngredientResponse[];
}

export interface MealIngredientResponse {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantityPerServing: number;
  unitOfMeasure: string;
}

export interface CreateMealRequest {
  name: string;
  description?: string | null;
  mealType: string;
  baseServings: number;
}

export type UpdateMealRequest = CreateMealRequest;

export interface AddMealIngredientRequest {
  ingredientId: number;
  quantityPerServing: number;
  unitOfMeasure: string;
}
