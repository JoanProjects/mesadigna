import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router';
import {useNotification} from '@/app/providers/NotificationProvider';
import {usePageTitle} from '@/hooks/usePageTitle';
import {useForm} from '@/hooks/useForm';
import {PageHeader} from '@/components/shared/PageHeader';
import {Alert, Button, Card, Input, Loader, Select, Textarea} from '@/components/ui';
import {mealService} from '../services/meal.service';
import {mealSchema} from '../schemas/meal.schema';
import {MEAL_TYPE_OPTIONS} from '@/constants/options';
import {ApiError} from '@/services/http/errors';
import {getErrorMessage, getFieldErrors} from '@/utils/formErrors';

export default function MealFormPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {success: notify} = useNotification();
    const isEdit = !!id;
    usePageTitle(isEdit ? 'Editar comida' : 'Nueva comida');

    const {
        values,
        errors,
        serverError,
        setServerError,
        setValues,
        setValue,
        setErrors,
        validate,
        handleChange
    } = useForm(mealSchema, {
        name: '', description: '', mealType: '', baseServings: 1,
    });
    const [loadingData, setLoadingData] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        mealService.getById(Number(id)).then(res => {
            if (res.success && res.data) {
                const m = res.data;
                setValues({
                    name: m.name,
                    description: m.description || '',
                    mealType: m.mealType,
                    baseServings: m.baseServings
                });
            }
        }).catch(() => {
        }).finally(() => setLoadingData(false));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
            if (isEdit) {
                const res = await mealService.update(Number(id), values);
                if (res.success) {
                    notify('Comida actualizada correctamente.');
                    navigate(`/comidas/${id}`);
                } else setServerError(res.message || 'Error al actualizar.');
            } else {
                const res = await mealService.create(values);
                if (res.success && res.data) {
                    notify('Comida creada correctamente.');
                    navigate(`/comidas/${res.data.id}`);
                } else setServerError(res.message || 'Error al crear comida.');
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

    return (
        <>
            <PageHeader title={isEdit ? 'Editar comida' : 'Nueva comida'}/>
            <Card>
                <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                    {serverError && <Alert variant="error">{serverError}</Alert>}
                    <Input label="Nombre" value={values.name} onChange={handleChange('name')} error={errors.name}/>
                    <Textarea label="Descripción" value={values.description ?? ''}
                              onChange={handleChange('description')} error={errors.description} rows={2}/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label="Tipo de comida" value={values.mealType} onChange={handleChange('mealType')}
                                options={MEAL_TYPE_OPTIONS} placeholder="Seleccione..." error={errors.mealType}/>
                        <Input label="Porciones base" type="number" min="1" value={String(values.baseServings)}
                               onChange={e => setValue('baseServings', Number(e.target.value))}
                               error={errors.baseServings}/>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={saving}>{isEdit ? 'Guardar cambios' : 'Crear comida'}</Button>
                        <Link to="/comidas"><Button variant="secondary" type="button">Cancelar</Button></Link>
                    </div>
                </form>
            </Card>
        </>
    );
}
