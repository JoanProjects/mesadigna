import { object, string } from 'yup';

export const checkInSchema = object({
  internalCode: string()
      .required('El código interno es obligatorio.')
      .trim()
      .min(1, 'El código interno es obligatorio.'),
  checkInMethod: string()
      .default('Manual'),
  notes: string()
      .default(''),
});