import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router';
import {useNotification} from '@/app/providers/NotificationProvider';
import {usePageTitle} from '@/hooks/usePageTitle';
import {useForm} from '@/hooks/useForm';
import {PageHeader} from '@/components/shared/PageHeader';
import {healthProfileService} from '../services/healthProfile.service';
import {healthProfileSchema} from '../schemas/healthProfile.schema';
import {SPECIAL_CONDITION_OPTIONS} from '@/constants/options';
import {ApiError} from '@/services/http/errors';
import {getErrorMessage} from '@/utils/formErrors';
import {Alert, Button, Card, Checkbox, Loader, Textarea} from "@/components/ui";

export default function HealthProfileFormPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {success: notify} = useNotification();
    const beneficiaryId = Number(id);
    const FLAG_MAP: Record<string, number> = {
        Ninguna: 0, AdultoMayor: 1, Menor: 2, Embarazada: 4, Lactancia: 8, Discapacidad: 16,
    };

    function parseSpecialConditions(raw: string | number): number {
        if (typeof raw === 'number') return raw;
        if (!raw || raw === 'Ninguna') return 0;
        return raw.split(',').reduce((acc, s) => acc | (FLAG_MAP[s.trim()] ?? 0), 0);
    }

    usePageTitle('Perfil de salud');

    const {
        values,
        errors,
        serverError,
        setServerError,
        setValues,
        setValue,
        validate,
        handleChange
    } = useForm(healthProfileSchema, {
        medicalConditions: '', dietaryRestrictions: '', allergies: '',
        hasHypertension: false, hasDiabetes: false,
        specialConditions: 0, nutritionalNotes: '', additionalNotes: '',
    });
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        healthProfileService.getByBeneficiary(beneficiaryId).then(res => {
            if (res.success && res.data) {
                const hp = res.data;
                setValues({
                    medicalConditions: hp.medicalConditions || '',
                    dietaryRestrictions: hp.dietaryRestrictions || '',
                    allergies: hp.allergies || '',
                    hasHypertension: hp.hasHypertension,
                    hasDiabetes: hp.hasDiabetes,
                    specialConditions: typeof hp.specialConditions === 'number'
                        ? hp.specialConditions
                        : parseSpecialConditions(hp.specialConditions || ''),
                    nutritionalNotes: hp.nutritionalNotes || '',
                    additionalNotes: hp.additionalNotes || '',
                });
            }
        }).catch(() => {
        }).finally(() => setLoadingData(false));
    }, [beneficiaryId]); // eslint-disable-line react-hooks/exhaustive-deps

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
            const res = await healthProfileService.upsert(beneficiaryId, values);
            if (res.success) {
                notify('Perfil de salud guardado correctamente.');
                navigate(`/beneficiarios/${beneficiaryId}`);
            } else setServerError(res.message || 'Error al guardar.');
        } catch (err) {
            setServerError(err instanceof ApiError ? getErrorMessage(err) : 'Error de conexión.');
        } finally {
            setSaving(false);
            submittingRef.current = false;
        }
    };

    if (loadingData) return <Loader message="Cargando perfil de salud..."/>;

    return (
        <>
            <PageHeader title="Perfil de salud" subtitle="Gestione las condiciones de salud del beneficiario"/>
            <Card>
                <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                    {serverError && <Alert variant="error">{serverError}</Alert>}
                    <Textarea label="Condiciones médicas" value={values.medicalConditions ?? ''}
                              onChange={handleChange('medicalConditions')} error={errors.medicalConditions} rows={3}/>
                    <Textarea label="Restricciones dietéticas" value={values.dietaryRestrictions ?? ''}
                              onChange={handleChange('dietaryRestrictions')} error={errors.dietaryRestrictions}
                              rows={3}/>
                    <Textarea label="Alergias" value={values.allergies ?? ''} onChange={handleChange('allergies')}
                              error={errors.allergies} rows={2}/>
                    <div className="flex gap-6">
                        <Checkbox label="Hipertensión" checked={values.hasHypertension as boolean}
                                  onChange={checked => setValue('hasHypertension', checked)}/>
                        <Checkbox label="Diabetes" checked={values.hasDiabetes as boolean}
                                  onChange={checked => setValue('hasDiabetes', checked)}/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            Condiciones especiales
                        </label>
                        <div className="flex flex-col gap-2">
                            {SPECIAL_CONDITION_OPTIONS.filter(o => o.value !== 0).map(option => (
                                <Checkbox
                                    key={option.value}
                                    label={option.label}
                                    checked={((values.specialConditions as number) & option.value) !== 0}
                                    onChange={(checked) => {
                                        const current = (values.specialConditions as number) || 0;
                                        const updated = checked
                                            ? current | option.value
                                            : current & ~option.value;
                                        setValue('specialConditions', updated);
                                    }}
                                />
                            ))}
                        </div>
                        {errors.specialConditions && <p className="text-xs text-danger-500">{errors.specialConditions}</p>}
                    </div>
                    <Textarea label="Notas nutricionales" value={values.nutritionalNotes ?? ''}
                              onChange={handleChange('nutritionalNotes')} error={errors.nutritionalNotes} rows={3}/>
                    <Textarea label="Notas adicionales" value={values.additionalNotes ?? ''}
                              onChange={handleChange('additionalNotes')} error={errors.additionalNotes} rows={3}/>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={saving}>Guardar perfil</Button>
                        <Link to={`/beneficiarios/${beneficiaryId}`}><Button variant="secondary"
                                                                             type="button">Cancelar</Button></Link>
                    </div>
                </form>
            </Card>
        </>
    );
}
