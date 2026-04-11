import {object, string} from 'yup';

export function getUserSchema(isEdit: boolean) {
    return object({
        firstName: string()
            .required('El nombre es obligatorio.'),
        lastName: string()
            .required('El apellido es obligatorio.'),
        email: string()
            .required('El correo es obligatorio.')
            .email('Formato de correo inválido.'),
        password: isEdit
            ? string().default('')
            : string()
                .required('La contraseña es obligatoria.')
                .min(8, 'Mínimo 8 caracteres.'),
        role: string()
            .required('El rol es obligatorio.'),
        phoneNumber: string()
            .required('El teléfono es obligatorio.')
            .matches(
                /^(809|829|849)-\d{3}-\d{4}$/,
                'Formato inválido. Ej: 809-123-4567'
            ),
    });
}
