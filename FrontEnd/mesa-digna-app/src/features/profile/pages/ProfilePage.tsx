import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from '@/hooks/useForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input, Button, Alert, Card } from '@/components/ui';
import { profileSchema } from '../schemas/profile.schema';
import { changePasswordSchema } from '../schemas/changePassword.schema';
import { ApiError } from '@/services/http/errors';
import { getFieldErrors, getErrorMessage } from '@/utils/formErrors';

export default function ProfilePage() {
  usePageTitle('Mi perfil');
  const { user, updateProfile, changePassword } = useAuth();
  const { success: notify } = useNotification();

  const profile = useForm(profileSchema, {
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phoneNumber: user?.phoneNumber || '',
  });
  const password = useForm(changePasswordSchema, {
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); profile.setServerError(null);
    const valid = await profile.validate(); if (!valid) return;
    setSavingProfile(true);
    try {
      await updateProfile({
        firstName: profile.values.firstName as string,
        lastName: profile.values.lastName as string,
        email: profile.values.email as string,
        phoneNumber: (profile.values.phoneNumber as string) || undefined,
      });
      notify('Perfil actualizado correctamente.');
    } catch (err) {
      if (err instanceof ApiError) { const fe = getFieldErrors(err); if (Object.keys(fe).length > 0) profile.setErrors(fe); profile.setServerError(getErrorMessage(err)); }
    } finally { setSavingProfile(false); }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); password.setServerError(null);
    const valid = await password.validate(); if (!valid) return;
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: password.values.currentPassword as string,
        newPassword: password.values.newPassword as string,
      });
      notify('Contraseña actualizada correctamente.');
      password.reset();
    } catch (err) {
      password.setServerError(err instanceof ApiError ? getErrorMessage(err) : 'Error al cambiar contraseña.');
    } finally { setSavingPassword(false); }
  };

  return (
    <>
      <PageHeader title="Mi perfil" subtitle={`${user?.fullName} — ${user?.role}`} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Datos personales">
          <form onSubmit={onSaveProfile} className="space-y-4">
            {profile.serverError && <Alert variant="error">{profile.serverError}</Alert>}
            <Input label="Nombre" value={profile.values.firstName} onChange={profile.handleChange('firstName')} error={profile.errors.firstName} />
            <Input label="Apellido" value={profile.values.lastName} onChange={profile.handleChange('lastName')} error={profile.errors.lastName} />
            <Input label="Correo electrónico" type="email" value={profile.values.email} onChange={profile.handleChange('email')} error={profile.errors.email} />
            <Input label="Teléfono" value={profile.values.phoneNumber ?? ''} onChange={profile.handleChange('phoneNumber')} error={profile.errors.phoneNumber} />
            <Button type="submit" loading={savingProfile}>Guardar cambios</Button>
          </form>
        </Card>

        <Card title="Cambiar contraseña">
          <form onSubmit={onChangePassword} className="space-y-4">
            {password.serverError && <Alert variant="error">{password.serverError}</Alert>}
            <Input label="Contraseña actual" type="password" value={password.values.currentPassword} onChange={password.handleChange('currentPassword')} error={password.errors.currentPassword} autoComplete="current-password" />
            <Input label="Nueva contraseña" type="password" value={password.values.newPassword} onChange={password.handleChange('newPassword')} error={password.errors.newPassword} autoComplete="new-password" />
            <Input label="Confirmar contraseña" type="password" value={password.values.confirmPassword} onChange={password.handleChange('confirmPassword')} error={password.errors.confirmPassword} autoComplete="new-password" />
            <Button type="submit" loading={savingPassword}>Cambiar contraseña</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
