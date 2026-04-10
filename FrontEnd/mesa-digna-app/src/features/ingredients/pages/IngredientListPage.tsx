import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faBan, faPlus, faInbox, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { Loader, Badge, Pagination, SearchInput, EmptyState, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { ingredientService } from '../services/ingredient.service';
import type { IngredientResponse } from '../types/ingredient.types';

export default function IngredientListPage() {
  usePageTitle('Ingredientes');
  const { success: notify, error: notifyError } = useNotification();

  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [selectedActive, setSelectedActive] = useState<boolean>(true);

  const loadData = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await ingredientService.getAll(p, 10, s || undefined);
      if (res.success && res.data) {
        setIngredients(res.data.items);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      notifyError('Error cargando ingredientes');
    }
    setLoading(false);
  }, [notifyError]);

  useEffect(() => { loadData(1, ''); }, [loadData]);

  const onSearch = () => {
    setPage(1);
    loadData(1, search);
  };

  const onPageChange = (p: number) => {
    setPage(p);
    loadData(p, search);
  };

  const confirmDeactivate = (i: IngredientResponse) => {
    setSelectedId(i.id);
    setSelectedName(i.name);
    setSelectedActive(i.isActive);
    setConfirmOpen(true);
  };

  const deactivate = async () => {
    if (!selectedId) return;
    try {
      await ingredientService.deactivate(selectedId);
      notify(selectedActive ? 'Ingrediente desactivado.' : 'Ingrediente activado.');
      setConfirmOpen(false);
      loadData(page, search);
    } catch {
      notifyError('Error al cambiar estado.');
    }
  };

  return (
      <>
        <PageHeader
            title="Ingredientes"
            subtitle="Gestión de ingredientes del comedor"
            actions={
              <Link to="/ingredientes/nuevo">
                <Button>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Nuevo ingrediente
                </Button>
              </Link>
            }
        />

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div
              className="flex-1 min-w-[200px]"
              onKeyDown={e => e.key === 'Enter' && onSearch()}
          >
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar ingrediente..."
            />
          </div>
        </div>

        {loading ? (
            <Loader message="Cargando ingredientes..." />
        ) : ingredients.length === 0 ? (
            <EmptyState
                icon={faInbox}
                title="Sin ingredientes"
                message="No se encontraron ingredientes."
            />
        ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Nombre</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Unidad</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Stock</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Mínimo</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Estado</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Disponibilidad</th>
                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase text-left">Acciones</th>
                  </tr>
                  </thead>

                  <tbody>
                  {ingredients.map(i => (
                      <tr key={i.id} className="border-b border-gray-50 hover:bg-primary-50/30">
                        <td className="px-4 py-3 text-sm font-medium">{i.name}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{i.unitOfMeasure}</td>
                        <td className="px-4 py-3 text-sm">{i.stockQuantity}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{i.minimumStock}</td>

                        {/* Estado */}
                        <td className="px-4 py-3 text-sm">
                          {i.isActive ? (
                              <Badge variant="active">Activo</Badge>
                          ) : (
                              <Badge variant="inactive">Inactivo</Badge>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 text-sm">
                          {i.stockQuantity <= 0 ? (
                              <Badge variant="danger">Sin stock</Badge>
                          ) : i.stockQuantity <= i.minimumStock ? (
                              <Badge variant="warning">Bajo</Badge>
                          ) : (
                              <Badge variant="success">OK</Badge>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-1">
                            <Link
                                to={`/ingredientes/${i.id}/editar`}
                                className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                                    !i.isActive && 'pointer-events-none opacity-40'
                                }`}
                                title="Editar"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </Link>

                            <button
                                onClick={() => confirmDeactivate(i)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    i.isActive
                                        ? 'hover:bg-danger-50 hover:text-danger-500 text-gray-400'
                                        : 'hover:bg-success-50 hover:text-success-500 text-gray-400'
                                }`}
                                title={i.isActive ? 'Desactivar' : 'Activar'}
                            >
                              <FontAwesomeIcon icon={i.isActive ? faBan : faRotateLeft} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              <div className="px-2 py-4 border-t border-gray-100">
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
              </div>
            </div>
        )}

        <ConfirmDialog
            open={confirmOpen}
            title={selectedActive ? 'Desactivar ingrediente' : 'Activar ingrediente'}
            message={`¿Está seguro de ${
                selectedActive ? 'desactivar' : 'activar'
            } "${selectedName}"?`}
            confirmText={selectedActive ? 'Desactivar' : 'Activar'}
            onConfirm={deactivate}
            onCancel={() => setConfirmOpen(false)}
        />
      </>
  );
}