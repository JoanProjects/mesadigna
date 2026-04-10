import {object, string} from 'yup';

export const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;

    const birthDate = new Date(dateOfBirth + 'T00:00:00Z');
    if (Number.isNaN(birthDate.getTime())) return null;

    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let age = todayLocal.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = todayLocal.getUTCMonth() - birthDate.getUTCMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && todayLocal.getUTCDate() < birthDate.getUTCDate())
    ) {
        age--;
    }

    return age;
};

export const beneficiarySchema = object({
    firstName: string()
        .required('El nombre es obligatorio.')
        .max(100, 'Máximo 100 caracteres.'),
    lastName: string()
        .required('El apellido es obligatorio.')
        .max(100, 'Máximo 100 caracteres.'),
    dateOfBirth: string()
        .required('La fecha de nacimiento es obligatoria.')
        .test('not-future', 'La fecha de nacimiento no puede ser futura.', (value) => {
            if (!value) return true;
            const birth = new Date(value + 'T00:00:00Z');
            if (Number.isNaN(birth.getTime())) return false;
            const now = new Date();
            const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            return birth <= todayUTC;
        }),
    sex: string()
        .required('El sexo es obligatorio.'),
    identityDocument: string()
            .transform((value) => value?.trim?.() ?? '')
            .nullable()
            .default('')
            .when('dateOfBirth', (dateOfBirth, schema) => {
                const birthDate = Array.isArray(dateOfBirth) ? dateOfBirth[0] : dateOfBirth;
                const age = calculateAge(birthDate || '');

                if (age !== null && age >= 18) {
                    return schema
                        .required('La cédula es obligatoria para mayores de edad.')
                        .test('cedula-format', 'La cédula debe tener 11 números.', (value) => {
                            const digits = (value || '').replace(/\D/g, '');
                            return digits.length === 11;
                        });
                }

                return schema.notRequired();
            })
    ,
    phoneNumber: string()
        .nullable()
        .default('')
        .transform((value) => value?.trim?.() ?? '')
        .test('phone-format', 'El teléfono debe tener 10 dígitos.', (value) => {
            if (!value) return true; // opcional
            const digits = value.replace(/\D/g, '');
            return digits.length === 10;
        }),
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