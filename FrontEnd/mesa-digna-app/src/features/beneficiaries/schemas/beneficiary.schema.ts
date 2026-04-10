import { object, string } from 'yup';

export const beneficiarySchema = object({
  firstName: string()
    .required('El nombre es obligatorio.')
    .max(100, 'Máximo 100 caracteres.'),
  lastName: string()
    .required('El apellido es obligatorio.')
    .max(100, 'Máximo 100 caracteres.'),
  dateOfBirth: string()
    .required('La fecha de nacimiento es obligatoria.'),
  sex: string()
    .required('El sexo es obligatorio.'),
  identityDocument: string()
    .nullable()
    .default(''),
  phoneNumber: string()
    .nullable()
    .default(''),
  address: string()
    .nullable()
    .default(''),
  emergencyContact: string()
    .nullable()
    .default(''),
  status: string()
    .default('Activo'),
  notes: string()
    .nullable()
    .default(''),
});
