import {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPen, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import {useNotification} from '@/app/providers/NotificationProvider';
import {usePageTitle} from '@/hooks/usePageTitle';
import {useForm} from '@/hooks/useForm';
import {Alert, Badge, Button, Card, Input, Loader, Select} from '@/components/ui';
import {ConfirmDialog} from '@/components/feedback/ConfirmDialog';
import {mealService} from '../services/meal.service';
import {ingredientService} from '@/features/ingredients/services/ingredient.service';
import {mealIngredientSchema} from '../schemas/mealIngredient.schema';
import {UNIT_OPTIONS} from '@/constants/options';
import {ApiError} from '@/services/http/errors';
import {getErrorMessage} from '@/utils/formErrors';
import type {MealResponse} from '../types/meal.types';

type SelectOption = { value: string; label: string };

export default function MealDetailPage() {
    const {id} = useParams();
    const {success: notify, error: notifyError} = useNotification();
    const [meal, setMeal] = useState<MealResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
    const [ingredientOptions, setIngredientOptions] = useState<SelectOption[]>([]);

    usePageTitle(meal?.name || 'Detalle comida');

    const {
        values,
        errors,
        serverError,
        setServerError,
        setValue,
        validate,
        handleChange,
        reset
    } = useForm(mealIngredientSchema, {
        ingredientId: 0, quantityPerServing: 0, unitOfMeasure: '',
    });

    const loadMeal = async () => {
        if (!id) return;
        try {
            const res = await mealService.getById(Number(id));
            if (res.success && res.data) setMeal(res.data);
        } catch { /* silent */
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMeal();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const submittingRef = useRef(false);

    const loadIngredients = async () => {
        try {
            const res = await ingredientService.getAll(1, 100);
            if (res.success && res.data) {
                setIngredientOptions(res.data.items.map(i => ({value: String(i.id), label: i.name})));
            }
        } catch (err) {
            console.error('Error loading ingredients:', err);
        }
    };

    useEffect(() => {
        if (showAddForm && ingredientOptions.length === 0) {
            loadIngredients();
        }
    }, [showAddForm, ingredientOptions.length]);

    const addIngredient = async (e: React.FormEvent) => {
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
            const res = await mealService.addIngredient(Number(id), values);
            if (res.success && res.data) {
                setMeal(res.data);
                notify('Ingrediente agregado.');
                reset();
                setShowAddForm(false);
            } else setServerError(res.message || 'Error al agregar.');
        } catch (err) {
            setServerError(err instanceof ApiError ? getErrorMessage(err) : 'Error de conexión.');
        } finally {
            setSaving(false);
            submittingRef.current = false;
        }
    };
    const removeIngredient = async () => {
        if (!confirmRemove || !id) return;
        try {
            await mealService.removeIngredient(Number(id), confirmRemove);
            notify('Ingrediente eliminado.');
            setConfirmRemove(null);
            loadMeal();
        } catch {
            notifyError('Error al eliminar ingrediente.');
        }
    };

    if (loading) return <Loader message="Cargando comida..."/>;
    if (!meal) return <div className="text-center py-12 text-text-secondary">Comida no encontrada.</div>;

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{meal.name}</h1>
                    <p className="text-sm text-text-secondary mt-1"><Badge
                        variant="info">{meal.mealType}</Badge> &middot; {meal.baseServings} porciones base</p>
                </div>
                <Link to={`/comidas/${id}/editar`}><Button variant="secondary" size="sm"><FontAwesomeIcon icon={faPen}
                                                                                                          className="mr-1.5"/>Editar</Button></Link>
            </div>

            {meal.description && <Card><p className="text-sm text-text-secondary">{meal.description}</p></Card>}

            <Card title="Ingredientes">
                {meal.ingredients.length === 0 ? (
                    <p className="text-sm text-text-light py-4 text-center">Sin ingredientes asignados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Ingrediente</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Cantidad/porción</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Unidad</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>{meal.ingredients.map(mi => (
                                <tr key={mi.id} className="border-b border-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{mi.ingredientName}</td>
                                    <td className="px-4 py-3 text-sm">{mi.quantityPerServing}</td>
                                    <td className="px-4 py-3 text-sm text-text-secondary">{mi.unitOfMeasure}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <button onClick={() => setConfirmRemove(mi.ingredientId)}
                                                className="p-1.5 rounded-lg hover:bg-danger-50 text-text-secondary hover:text-danger-500 transition-colors cursor-pointer border-none bg-transparent"
                                                title="Eliminar">
                                            <FontAwesomeIcon icon={faTrash}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
                <div className="mt-4">
                    {showAddForm ? (
                        <form onSubmit={addIngredient} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            {serverError && <Alert variant="error">{serverError}</Alert>}
                            <Select
                                label="Ingrediente"
                                value={String(values.ingredientId || '')}
                                onChange={e => setValue('ingredientId', Number(e.target.value))}
                                options={ingredientOptions}
                                placeholder="Seleccione..."
                                error={errors.ingredientId}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input label="Cantidad por porción" type="number" step="0.01" min="0.01"
                                       value={String(values.quantityPerServing)}
                                       onChange={e => setValue('quantityPerServing', Number(e.target.value))}
                                       error={errors.quantityPerServing}/>
                                <Select label="Unidad" value={values.unitOfMeasure}
                                        onChange={handleChange('unitOfMeasure')} options={UNIT_OPTIONS}
                                        placeholder="Seleccione..." error={errors.unitOfMeasure}/>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" loading={saving}>Agregar</Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => {
                                    setShowAddForm(false);
                                    reset();
                                }}>Cancelar</Button>
                            </div>
                        </form>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)}><FontAwesomeIcon
                            icon={faPlus} className="mr-1.5"/>Agregar ingrediente</Button>
                    )}
                </div>
            </Card>

            <ConfirmDialog open={!!confirmRemove} title="Eliminar ingrediente"
                           message="¿Está seguro de eliminar este ingrediente de la comida?" confirmText="Eliminar"
                           onConfirm={removeIngredient} onCancel={() => setConfirmRemove(null)}/>
        </>
    );
}
