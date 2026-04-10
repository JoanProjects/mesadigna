import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from '@/hooks/useForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input, Select, Textarea, Button, Alert, Loader, Card } from '@/components/ui';
import { beneficiaryService } from '../services/beneficiary.service';
import { beneficiarySchema } from '../schemas/beneficiary.schema';
import { SEX_OPTIONS, STATUS_OPTIONS } from '@/constants/options';
import { ApiError } from '@/services/http/errors';
import { getFieldErrors, getErrorMessage } from '@/utils/formErrors';

export default function BeneficiaryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success: notify } = useNotification();
  const isEdit = !!id;
  usePageTitle(isEdit ? 'Editar beneficiario' : 'Nuevo beneficiario');

  const { values, errors, serverError, setServerError, setValues, setErrors, validate, handleChange } = useForm(beneficiarySchema, {
    firstName: '', lastName: '', dateOfBirth: '', sex: '',
    identityDocument: '', phoneNumber: '', address: '',
    emergencyContact: '', status: 'Activo', notes: '',
  });
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    beneficiaryService.getById(Number(id)).then(res => {
      if (res.success && res.data) {
        const b = res.data;
        setValues({ firstName: b.firstName, lastName: b.lastName, dateOfBirth: b.dateOfBirth.split('T')[0], sex: b.sex, identityDocument: b.identityDocument || '', phoneNumber: b.phoneNumber || '', address: b.address || '', emergencyContact: b.emergencyContact || '', status: b.status, notes: b.notes || '' });
      }
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const valid = await validate();
    if (!valid) return;
    setSaving(true);
    try {
      if (isEdit) {
        const res = await beneficiaryService.update(Number(id), values);
        if (res.success) { notify('Beneficiario actualizado correctamente.'); navigate(`/beneficiarios/${id}`); }
        else setServerError(res.message || 'Error al actualizar.');
      } else {
        const res = await beneficiaryService.create(values);
        if (res.success && res.data) { notify('Beneficiario creado correctamente.'); navigate(`/beneficiarios/${res.data.id}`); }
        else setServerError(res.message || 'Error al crear beneficiario.');
      }
    } catch (err) {
      if (err instanceof ApiError) { const fe = getFieldErrors(err); if (Object.keys(fe).length > 0) setErrors(fe); setServerError(getErrorMessage(err)); }
    } finally { setSaving(false); }
  };

  if (loadingData) return <Loader message="Cargando datos..." />;

  return (
    <>
      <PageHeader title={isEdit ? 'Editar beneficiario' : 'Nuevo beneficiario'} subtitle={isEdit ? 'Modifique los datos del beneficiario' : 'Complete los datos para registrar un nuevo beneficiario'} />
      <Card>
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={values.firstName} onChange={handleChange('firstName')} error={errors.firstName} />
            <Input label="Apellido" value={values.lastName} onChange={handleChange('lastName')} error={errors.lastName} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Fecha de nacimiento" type="date" value={values.dateOfBirth} onChange={handleChange('dateOfBirth')} error={errors.dateOfBirth} />
            <Select label="Sexo" value={values.sex} onChange={handleChange('sex')} options={SEX_OPTIONS} placeholder="Seleccione..." error={errors.sex} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Documento de identidad" value={values.identityDocument ?? ''} onChange={handleChange('identityDocument')} error={errors.identityDocument} />
            <Input label="Teléfono" value={values.phoneNumber ?? ''} onChange={handleChange('phoneNumber')} error={errors.phoneNumber} />
          </div>
          <Input label="Dirección" value={values.address ?? ''} onChange={handleChange('address')} error={errors.address} />
          <Input label="Contacto de emergencia" value={values.emergencyContact ?? ''} onChange={handleChange('emergencyContact')} error={errors.emergencyContact} />
          {isEdit && <Select label="Estado" value={values.status} onChange={handleChange('status')} options={STATUS_OPTIONS} error={errors.status} />}
          <Textarea label="Notas" value={values.notes ?? ''} onChange={handleChange('notes')} error={errors.notes} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar cambios' : 'Crear beneficiario'}</Button>
            <Link to="/beneficiarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
