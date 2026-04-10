import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router';
import {useNotification} from '@/app/providers/NotificationProvider';
import {usePageTitle} from '@/hooks/usePageTitle';
import {useForm} from '@/hooks/useForm';
import {PageHeader} from '@/components/shared/PageHeader';
import {Alert, Button, Card, Input, Loader, Select, Textarea} from '@/components/ui';
import {beneficiaryService} from '../services/beneficiary.service';
import {SEX_OPTIONS, STATUS_OPTIONS} from '@/constants/options';
import {ApiError} from '@/services/http/errors';
import {getErrorMessage, getFieldErrors} from '@/utils/formErrors';
import {beneficiarySchema, calculateAge} from "@/features/beneficiaries/schemas/beneficiary.schema.ts";


const formatIdentityDocument = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
};

const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};


export default function BeneficiaryFormPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {success: notify} = useNotification();
    const isEdit = !!id;
    usePageTitle(isEdit ? 'Editar beneficiario' : 'Nuevo beneficiario');

    const {
        values,
        errors,
        serverError,
        setServerError,
        setValues,
        setValue,
        setErrors,
        validate,
        handleChange,
    } = useForm(beneficiarySchema, {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        sex: '',
        identityDocument: '',
        phoneNumber: '',
        address: '',
        emergencyContact: '',
        status: 'Activo',
        notes: '',
    });

    const [loadingData, setLoadingData] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const age = calculateAge(values.dateOfBirth);
    const isMinor = age !== null && age < 18;

    useEffect(() => {
        if (!id) return;

        beneficiaryService.getById(Number(id))
            .then((res) => {
                if (res.success && res.data) {
                    const b = res.data;
                    setValues({
                        firstName: b.firstName,
                        lastName: b.lastName,
                        dateOfBirth: b.dateOfBirth.split('T')[0],
                        sex: b.sex,
                        identityDocument: formatIdentityDocument(b.identityDocument || ''),
                        phoneNumber: b.phoneNumber || '',
                        address: b.address || '',
                        emergencyContact: b.emergencyContact || '',
                        status: b.status,
                        notes: b.notes || '',
                    });
                }
            })
            .catch(() => {
            })
            .finally(() => setLoadingData(false));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleIdentityDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('identityDocument', formatIdentityDocument(e.target.value));
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('phoneNumber', formatPhoneNumber(e.target.value));
    };

    const submittingRef = useRef(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingRef.current) return;
        submittingRef.current = true;
        setServerError(null);

        const valid = await validate();
        if (!valid) {
            submittingRef.current = false;
            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...values,
                identityDocument: isMinor ? null : (values.identityDocument || '').replace(/\D/g, ''),
                phoneNumber: (values.phoneNumber || '').replace(/\D/g, '') || null,
            };

            if (isEdit) {
                const res = await beneficiaryService.update(Number(id), payload);

                if (res.success) {
                    notify('Beneficiario actualizado correctamente.');
                    navigate(`/beneficiarios/${id}`);
                } else {
                    setServerError(res.message || 'Error al actualizar.');
                }
            } else {
                const res = await beneficiaryService.create(payload);

                if (res.success && res.data) {
                    notify('Beneficiario creado correctamente.');
                    navigate(`/beneficiarios/${res.data.id}`);
                } else {
                    setServerError(res.message || 'Error al crear beneficiario.');
                }
            }
        } catch (err) {
            if (err instanceof ApiError) {
                const fe = getFieldErrors(err);
                if (Object.keys(fe).length > 0) setErrors(fe);
                setServerError(getErrorMessage(err));
            }
        } finally {
            setSaving(false);
            submittingRef.current = false;
        }
    };

    if (loadingData) return <Loader message="Cargando datos..."/>;

    return (<><PageHeader
            title={isEdit ? 'Editar beneficiario' : 'Nuevo beneficiario'}
            subtitle={
                isEdit
                    ? 'Modifique los datos del beneficiario'
                    : 'Complete los datos para registrar un nuevo beneficiario'
            }
        />

            <Card>
                <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                    {serverError && <Alert variant="error">{serverError}</Alert>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Nombre"
                            value={values.firstName}
                            onChange={handleChange('firstName')}
                            error={errors.firstName}
                        />
                        <Input
                            label="Apellido"
                            value={values.lastName}
                            onChange={handleChange('lastName')}
                            error={errors.lastName}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Fecha de nacimiento"
                            type="date"
                            value={values.dateOfBirth}
                            onChange={handleChange('dateOfBirth')}
                            error={errors.dateOfBirth}
                        />
                        <Select
                            label="Sexo"
                            value={values.sex}
                            onChange={handleChange('sex')}
                            options={SEX_OPTIONS}
                            placeholder="Seleccione..."
                            error={errors.sex}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Cedula"
                            value={values.identityDocument ?? ''}
                            onChange={handleIdentityDocumentChange}
                            error={errors.identityDocument}
                            disabled={isMinor}
                        />
                        <Input
                            label="Teléfono"
                            value={values.phoneNumber ?? ''}
                            onChange={handlePhoneNumberChange}
                            error={errors.phoneNumber}
                        />
                    </div>

                    <Input
                        label="Dirección"
                        value={values.address ?? ''}
                        onChange={handleChange('address')}
                        error={errors.address}
                    />

                    <Input
                        label="Contacto de emergencia"
                        value={values.emergencyContact ?? ''}
                        onChange={handleChange('emergencyContact')}
                        error={errors.emergencyContact}
                    />

                    {isEdit && (
                        <Select
                            label="Estado"
                            value={values.status}
                            onChange={handleChange('status')}
                            options={STATUS_OPTIONS}
                            error={errors.status}
                        />
                    )}

                    <Textarea
                        label="Notas"
                        value={values.notes ?? ''}
                        onChange={handleChange('notes')}
                        error={errors.notes}
                        rows={3}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={saving}>
                            {isEdit ? 'Guardar cambios' : 'Crear beneficiario'}
                        </Button>
                        <Link to="/beneficiarios">
                            <Button variant="secondary" type="button">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </>
    );
}