import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from '@/hooks/useForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { healthProfileService } from '../services/healthProfile.service';
import { healthProfileSchema } from '../schemas/healthProfile.schema';
import { SPECIAL_CONDITION_OPTIONS } from '@/constants/options';
import { ApiError } from '@/services/http/errors';
import { getErrorMessage } from '@/utils/formErrors';
import {Alert, Button, Card, Checkbox, Loader, Textarea} from "@/components/ui";

export default function HealthProfileFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success: notify } = useNotification();
  const beneficiaryId = Number(id);
  usePageTitle('Perfil de salud');

  const { values, errors, serverError, setServerError, setValues, setValue, validate, handleChange } = useForm(healthProfileSchema, {
    medicalConditions: '', dietaryRestrictions: '', allergies: '',
    hasHypertension: false, hasDiabetes: false,
    specialConditions: '', nutritionalNotes: '', additionalNotes: '',
  });
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    healthProfileService.getByBeneficiary(beneficiaryId).then(res => {
      if (res.success && res.data) {
        const hp = res.data;
        setValues({ medicalConditions: hp.medicalConditions || '', dietaryRestrictions: hp.dietaryRestrictions || '', allergies: hp.allergies || '', hasHypertension: hp.hasHypertension, hasDiabetes: hp.hasDiabetes, specialConditions: hp.specialConditions || '', nutritionalNotes: hp.nutritionalNotes || '', additionalNotes: hp.additionalNotes || '' });
      }
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [beneficiaryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setServerError(null);
    const valid = await validate(); if (!valid) return;
    setSaving(true);
    try {
      const res = await healthProfileService.upsert(beneficiaryId, values);
      if (res.success) { notify('Perfil de salud guardado correctamente.'); navigate(`/beneficiarios/${beneficiaryId}`); }
      else setServerError(res.message || 'Error al guardar.');
    } catch (err) { setServerError(err instanceof ApiError ? getErrorMessage(err) : 'Error de conexión.'); }
    finally { setSaving(false); }
  };

  if (loadingData) return <Loader message="Cargando perfil de salud..." />;

  return (
    <>
      <PageHeader title="Perfil de salud" subtitle="Gestione las condiciones de salud del beneficiario" />
      <Card>
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <Textarea label="Condiciones médicas" value={values.medicalConditions ?? ''} onChange={handleChange('medicalConditions')} error={errors.medicalConditions} rows={3} />
          <Textarea label="Restricciones dietéticas" value={values.dietaryRestrictions ?? ''} onChange={handleChange('dietaryRestrictions')} error={errors.dietaryRestrictions} rows={3} />
          <Textarea label="Alergias" value={values.allergies ?? ''} onChange={handleChange('allergies')} error={errors.allergies} rows={2} />
          <div className="flex gap-6">
            <Checkbox label="Hipertensión" checked={values.hasHypertension as boolean} onChange={checked => setValue('hasHypertension', checked)} />
            <Checkbox label="Diabetes" checked={values.hasDiabetes as boolean} onChange={checked => setValue('hasDiabetes', checked)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Condiciones especiales</label>
            <div className="flex flex-col gap-2">
              {SPECIAL_CONDITION_OPTIONS.filter(o => o.value !== 'Ninguna').map(option => (
                  <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={((values.specialConditions as string) ?? '').split(', ').includes(option.value)}
                      onChange={(checked) => {
                        const current = ((values.specialConditions as string) ?? '')
                            .split(', ')
                            .filter(v => v && v !== 'Ninguna');
                        const updated = checked
                            ? [...current, option.value]
                            : current.filter(v => v !== option.value);
                        setValue('specialConditions', updated.length > 0 ? updated.join(', ') : 'Ninguna');
                      }}
                  />
              ))}
            </div>
            {errors.specialConditions && <p className="text-xs text-danger-500">{errors.specialConditions}</p>}
          </div>          <Textarea label="Notas nutricionales" value={values.nutritionalNotes ?? ''} onChange={handleChange('nutritionalNotes')} error={errors.nutritionalNotes} rows={3} />
          <Textarea label="Notas adicionales" value={values.additionalNotes ?? ''} onChange={handleChange('additionalNotes')} error={errors.additionalNotes} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Guardar perfil</Button>
            <Link to={`/beneficiarios/${beneficiaryId}`}><Button variant="secondary" type="button">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
