import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faPlus, faInbox } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { Loader, Badge, Pagination, SearchInput, EmptyState, Button } from '@/components/ui';
import { mealService } from '../services/meal.service';
import type { MealResponse } from '../types/meal.types';

export default function MealListPage() {
  usePageTitle('Comidas');
  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await mealService.getAll(p, 10, s || undefined);
      if (res.success && res.data) { setMeals(res.data.items);  setTotalPages(res.data.totalPages); }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(1, ''); }, [loadData]);
  const onSearch = () => { setPage(1); loadData(1, search); };
  const onPageChange = (p: number) => { setPage(p); loadData(p, search); };

  return (
    <>
      <PageHeader title="Comidas" subtitle="Gestión de comidas del comedor"
        actions={<Link to="/comidas/nueva"><Button><FontAwesomeIcon icon={faPlus} className="mr-2" />Nueva comida</Button></Link>} />
      <div className="mb-4" onKeyDown={e => e.key === 'Enter' && onSearch()}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar comida..." />
      </div>
      {loading ? <Loader message="Cargando comidas..." /> : meals.length === 0 ? (
        <EmptyState icon={faInbox} title="Sin comidas" message="No se encontraron comidas registradas." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Porciones base</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Ingredientes</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
            </tr></thead>
            <tbody>{meals.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium"><Link to={`/comidas/${m.id}`} className="text-primary-700 hover:text-primary-800 no-underline hover:underline">{m.name}</Link></td>
                <td className="px-4 py-3 text-sm"><Badge variant="info">{m.mealType}</Badge></td>
                <td className="px-4 py-3 text-sm">{m.baseServings}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{m.ingredients.length}</td>
                <td className="px-4 py-3 text-sm"><div className="flex gap-1">
                  <Link to={`/comidas/${m.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors no-underline" title="Ver"><FontAwesomeIcon icon={faEye} /></Link>
                  <Link to={`/comidas/${m.id}/editar`} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors no-underline" title="Editar"><FontAwesomeIcon icon={faPen} /></Link>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="px-2 py-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        </div>
      )}
    </>
  );
}
