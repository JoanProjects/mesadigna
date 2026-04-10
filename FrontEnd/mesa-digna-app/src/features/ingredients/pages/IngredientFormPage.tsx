import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from '@/hooks/useForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input, Select, Textarea, Button, Alert, Loader, Card } from '@/components/ui';
import { ingredientService } from '../services/ingredient.service';
import { ingredientSchema } from '../schemas/ingredient.schema';
import { UNIT_OPTIONS } from '@/constants/options';
import { ApiError } from '@/services/http/errors';
import { getFieldErrors, getErrorMessage } from '@/utils/formErrors';

export default function IngredientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success: notify } = useNotification();
  const isEdit = !!id;
  usePageTitle(isEdit ? 'Editar ingrediente' : 'Nuevo ingrediente');

  const { values, errors, serverError, setServerError, setValues, setErrors, validate, handleChange } = useForm(ingredientSchema, {
    name: '', description: '', unitOfMeasure: '', stockQuantity: 0, minimumStock: 0,
  });
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    ingredientService.getById(Number(id)).then(res => {
      if (res.success && res.data) {
        const i = res.data;
        setValues({ name: i.name, description: i.description || '', unitOfMeasure: i.unitOfMeasure, stockQuantity: i.stockQuantity, minimumStock: i.minimumStock });
      }
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setServerError(null);
    const valid = await validate(); if (!valid) return;
    setSaving(true);
    try {
      if (isEdit) {
        const res = await ingredientService.update(Number(id), values);
        if (res.success) { notify('Ingrediente actualizado correctamente.'); navigate('/ingredientes'); }
        else setServerError(res.message || 'Error al actualizar.');
      } else {
        const res = await ingredientService.create(values);
        if (res.success) { notify('Ingrediente creado correctamente.'); navigate('/ingredientes'); }
        else setServerError(res.message || 'Error al crear ingrediente.');
      }
    } catch (err) {
      if (err instanceof ApiError) { const fe = getFieldErrors(err); if (Object.keys(fe).length > 0) setErrors(fe); setServerError(getErrorMessage(err)); }
    } finally { setSaving(false); }
  };

  if (loadingData) return <Loader message="Cargando datos..." />;

  return (
    <>
      <PageHeader title={isEdit ? 'Editar ingrediente' : 'Nuevo ingrediente'} />
      <Card>
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <Input label="Nombre" value={values.name} onChange={handleChange('name')} error={errors.name} />
          <Textarea label="Descripción" value={values.description ?? ''} onChange={handleChange('description')} error={errors.description} rows={2} />
          <Select label="Unidad de medida" value={values.unitOfMeasure} onChange={handleChange('unitOfMeasure')} options={UNIT_OPTIONS} placeholder="Seleccione..." error={errors.unitOfMeasure} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cantidad en stock" type="number" value={String(values.stockQuantity)} onChange={handleChange('stockQuantity')} error={errors.stockQuantity} />
            <Input label="Stock mínimo" type="number" value={String(values.minimumStock)} onChange={handleChange('minimumStock')} error={errors.minimumStock} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{isEdit ? 'Guardar cambios' : 'Crear ingrediente'}</Button>
            <Link to="/ingredientes"><Button variant="secondary" type="button">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
