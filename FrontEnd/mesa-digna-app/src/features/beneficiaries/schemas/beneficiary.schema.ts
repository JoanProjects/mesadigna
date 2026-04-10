import {object, string} from 'yup';

const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    if (Number.isNaN(birthDate.getTime())) return null;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
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
        .required('La fecha de nacimiento es obligatoria.'),
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