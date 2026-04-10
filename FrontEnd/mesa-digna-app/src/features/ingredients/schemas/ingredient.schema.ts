import { object, string, number } from 'yup';

export const ingredientSchema = object({
  name: string()
    .required('El nombre es obligatorio.'),
  description: string()
    .nullable()
    .default(''),
  unitOfMeasure: string()
    .required('La unidad de medida es obligatoria.'),
  stockQuantity: number()
    .required('La cantidad en stock es obligatoria.')
    .min(0, 'No puede ser negativo.')
    .typeError('Debe ser un número.'),
  minimumStock: number()
    .required('El stock mínimo es obligatorio.')
    .min(0, 'No puede ser negativo.')
    .typeError('Debe ser un número.'),
});
