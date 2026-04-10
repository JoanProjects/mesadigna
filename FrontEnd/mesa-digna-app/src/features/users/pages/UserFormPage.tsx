import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from '@/hooks/useForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input, Select, Button, Alert, Loader, Card } from '@/components/ui';
import { userService } from '../services/user.service';
import { getUserSchema } from '../schemas/user.schema';
import { ROLE_OPTIONS } from '@/constants/options';
import { ApiError } from '@/services/http/errors';
import { getFieldErrors, getErrorMessage } from '@/utils/formErrors';

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success: notify } = useNotification();
  const isEdit = !!id;
  usePageTitle(isEdit ? 'Editar usuario' : 'Nuevo usuario');

  const schema = useMemo(() => getUserSchema(isEdit), [isEdit]);
  const { values, errors, serverError, setServerError, setValues, setErrors, validate, handleChange } = useForm(schema, {
    firstName: '', lastName: '', email: '', password: '', role: '', phoneNumber: '',
  });
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    userService.getById(Number(id)).then(res => {
      if (res.success && res.data) {
        const u = res.data;
        setValues({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role, phoneNumber: u.phoneNumber || '' });
      }
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setServerError(null);
    const valid = await validate(); if (!valid) return;
    setSaving(true);
    try {
      if (isEdit) {
        const res = await userService.update(Number(id), { firstName: values.firstName as string, lastName: values.lastName as string, email: values.email as string, role: values.role as string, phoneNumber: (values.phoneNumber as string) || undefined });
        if (res.success) { notify('Usuario actualizado correctamente.'); navigate('/usuarios'); }
        else setServerError(res.message || 'Error al actualizar.');
      } else {
        const res = await userService.create(values as { firstName: string; lastName: string; email: string; password: string; role: string; phoneNumber?: string });
        if (res.success) { notify('Usuario creado correctamente.'); navigate('/usuarios'); }
        else setServerError(res.message || 'Error al crear usuario.');
      }
    } catch (err) {
      if (err instanceof ApiError) { const fe = getFieldErrors(err); if (Object.keys(fe).length > 0) setErrors(fe); setServerError(getErrorMessage(err)); }
    } finally { setSaving(false); }
  };

  if (loadingData) return <Loader message="Cargando datos..." />;

  return (
    <>
      <PageHeader title={isEdit ? 'Editar usuario' : 'Nuevo usuario'} />
      <Card>
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={values.firstName} onChange={handleChange('firstName')} error={errors.firstName} />
            <Input label="Apellido" value={values.lastName} onChange={handleChange('lastName')} error={errors.lastName} />
          </div>
          <Input label="Correo electrónico" type="email" value={values.email} onChange={handleChange('email')} error={errors.email} />
          {!isEdit && <Input label="Contraseña" type="password" value={values.password} onChange={handleChange('password')} error={errors.password} autoComplete="new-password" />}
          <Select label="Rol" value={values.role} onChange={handleChange('role')} options={ROLE_OPTIONS} placeholder="Seleccione..." error={errors.role} />
          <Input label="Teléfono" value={values.phoneNumber ?? ''} onChange={handleChange('phoneNumber')} error={errors.phoneNumber} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar cambios' : 'Crear usuario'}</Button>
            <Link to="/usuarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
