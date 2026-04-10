import { object, string, number } from 'yup';

export const mealSchema = object({
  name: string()
    .required('El nombre es obligatorio.'),
  description: string()
    .nullable()
    .default(''),
  mealType: string()
    .required('El tipo de comida es obligatorio.'),
  baseServings: number()
    .required('Las porciones base son obligatorias.')
    .min(1, 'Mínimo 1 porción.')
    .typeError('Debe ser un número.'),
});
