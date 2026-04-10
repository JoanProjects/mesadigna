import { object, string, boolean } from 'yup';

export const healthProfileSchema = object({
  medicalConditions: string()
    .nullable()
    .default(''),
  dietaryRestrictions: string()
    .nullable()
    .default(''),
  allergies: string()
    .nullable()
    .default(''),
  hasHypertension: boolean()
    .default(false),
  hasDiabetes: boolean()
    .default(false),
  specialConditions: string()
    .nullable()
    .default(''),
  nutritionalNotes: string()
    .nullable()
    .default(''),
  additionalNotes: string()
    .nullable()
    .default(''),
});
