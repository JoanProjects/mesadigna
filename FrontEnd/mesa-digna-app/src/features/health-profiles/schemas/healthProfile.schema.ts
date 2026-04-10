import { object, string, boolean, number } from 'yup';

export const healthProfileSchema = object({
  medicalConditions: string()
      .nullable()
      .default('')
      .max(1000, 'Máximo 1000 caracteres.'),
  dietaryRestrictions: string()
      .nullable()
      .default('')
      .max(500, 'Máximo 500 caracteres.'),
  allergies: string()
      .nullable()
      .default('')
      .max(500, 'Máximo 500 caracteres.'),
  hasHypertension: boolean()
      .default(false),
  hasDiabetes: boolean()
      .default(false),
  specialConditions: number()
      .default(0),
  nutritionalNotes: string()
      .nullable()
      .default('')
      .max(1000, 'Máximo 1000 caracteres.'),
  additionalNotes: string()
      .nullable()
      .default('')
      .max(1000, 'Máximo 1000 caracteres.'),
});