import { object, string } from 'yup';

export const profileSchema = object({
  firstName: string()
    .required('El nombre es obligatorio.')
    .min(2, 'Mínimo 2 caracteres.')
    .max(100, 'Máximo 100 caracteres.'),
  lastName: string()
    .required('El apellido es obligatorio.')
    .min(2, 'Mínimo 2 caracteres.')
    .max(100, 'Máximo 100 caracteres.'),
  email: string()
    .required('El correo es obligatorio.')
    .email('Formato de correo inválido.')
    .max(255, 'Máximo 255 caracteres.'),
  phoneNumber: string()
    .nullable()
    .default(null),
});
