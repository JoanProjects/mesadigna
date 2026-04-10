import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faBan, faPlus, faInbox } from '@fortawesome/free-solid-svg-icons';
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
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState('');

  const loadData = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await ingredientService.getAll(p, 10, s || undefined);
      if (res.success && res.data) { setIngredients(res.data.items); setTotalCount(res.data.totalCount); setTotalPages(res.data.totalPages); }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(1, ''); }, [loadData]);
  const onSearch = () => { setPage(1); loadData(1, search); };
  const onPageChange = (p: number) => { setPage(p); loadData(p, search); };

  const confirmDeactivate = (i: IngredientResponse) => { setSelectedId(i.id); setSelectedName(i.name); setConfirmOpen(true); };
  const deactivate = async () => {
    if (!selectedId) return;
    try { await ingredientService.deactivate(selectedId); notify('Ingrediente eliminado correctamente.'); setConfirmOpen(false); loadData(page, search); }
    catch { notifyError('Error al eliminar ingrediente.'); }
  };

  return (
    <>
      <PageHeader title="Ingredientes" subtitle="Gestión de ingredientes del comedor"
        actions={<Link to="/ingredientes/nuevo"><Button><FontAwesomeIcon icon={faPlus} className="mr-2" />Nuevo ingrediente</Button></Link>} />
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex-1 min-w-[200px]" onKeyDown={e => e.key === 'Enter' && onSearch()}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar ingrediente..." />
        </div>
      </div>
      {loading ? <Loader message="Cargando ingredientes..." /> : ingredients.length === 0 ? (
        <EmptyState icon={faInbox} title="Sin ingredientes" message="No se encontraron ingredientes." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Unidad</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Mínimo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
            </tr></thead>
            <tbody>{ingredients.map(i => (
              <tr key={i.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{i.name}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{i.unitOfMeasure}</td>
                <td className="px-4 py-3 text-sm">{i.stockQuantity}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{i.minimumStock}</td>
                <td className="px-4 py-3 text-sm">{i.isLowStock ? <Badge variant="warning">Stock bajo</Badge> : <Badge variant="active">OK</Badge>}</td>
                <td className="px-4 py-3 text-sm"><div className="flex gap-1">
                  <Link to={`/ingredientes/${i.id}/editar`} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors no-underline" title="Editar"><FontAwesomeIcon icon={faPen} /></Link>
                  <button onClick={() => confirmDeactivate(i)} className="p-1.5 rounded-lg hover:bg-danger-50 text-text-secondary hover:text-danger-500 transition-colors cursor-pointer border-none bg-transparent" title="Eliminar"><FontAwesomeIcon icon={faBan} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
            <span className="text-xs text-text-light ml-2">{totalCount} registros</span>
          </div>
        </div>
      )}
      <ConfirmDialog open={confirmOpen} title="Eliminar ingrediente" message={`¿Está seguro de eliminar "${selectedName}"?`} confirmText="Eliminar" onConfirm={deactivate} onCancel={() => setConfirmOpen(false)} />
    </>
  );
}
