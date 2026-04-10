import { object, string, number } from 'yup';

export const mealIngredientSchema = object({
  ingredientId: number()
    .required('Seleccione un ingrediente.')
    .typeError('Seleccione un ingrediente.'),
  quantityPerServing: number()
    .required('La cantidad por porción es obligatoria.')
    .min(0.01, 'Debe ser mayor a 0.')
    .typeError('Debe ser un número.'),
  unitOfMeasure: string()
    .required('La unidad de medida es obligatoria.'),
});
