import { object, string, ref } from 'yup';

export const changePasswordSchema = object({
  currentPassword: string()
    .required('La contraseña actual es obligatoria.'),
  newPassword: string()
    .required('La nueva contraseña es obligatoria.')
    .min(8, 'Mínimo 8 caracteres.')
    .max(255, 'Máximo 255 caracteres.'),
  confirmPassword: string()
    .required('Confirme la nueva contraseña.')
    .oneOf([ref('newPassword')], 'Las contraseñas no coinciden.'),
});
