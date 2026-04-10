import { object, string } from 'yup';

export const loginSchema = object({
  email: string()
    .required('El correo es obligatorio.')
    .email('Formato de correo inválido.'),
  password: string()
    .required('La contraseña es obligatoria.'),
});
