import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faBan, faCircleCheck, faUserPlus, faInbox } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { Loader, Badge, Pagination, SearchInput, EmptyState, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { beneficiaryService } from '../services/beneficiary.service';
import { formatDate } from '@/utils/formatDate';
import { STATUS_OPTIONS } from '@/constants/options';
import type { BeneficiaryResponse } from '../types/beneficiary.types';

function getStatusVariant(status: string): 'active' | 'inactive' | 'suspended' | 'info' {
  switch (status) {
    case 'Activo': return 'active';
    case 'Inactivo': return 'inactive';
    case 'Suspendido': return 'suspended';
    default: return 'info';
  }
}

export default function BeneficiaryListPage() {
  usePageTitle('Beneficiarios');
  const { canManageBeneficiaries } = useAuth();
  const { success: notify, error: notifyError } = useNotification();

  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState('');

  const loadData = useCallback(async (p: number, s: string, st: string) => {
    setLoading(true);
    try {
      const res = await beneficiaryService.getAll({ page: p, pageSize: 10, search: s || undefined, status: st || undefined });
      if (res.success && res.data) {
        setBeneficiaries(res.data.items);
        setTotalPages(res.data.totalPages);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(1, '', ''); }, [loadData]);

  const onSearch = () => { setPage(1); loadData(1, search, statusFilter); };
  const onFilterChange = (val: string) => { setStatusFilter(val); setPage(1); loadData(1, search, val); };
  const onPageChange = (p: number) => { setPage(p); loadData(p, search, statusFilter); };

  const confirmDeactivate = (b: BeneficiaryResponse) => { setSelectedId(b.id); setSelectedName(b.fullName); setConfirmOpen(true); };
  const deactivate = async () => {
    if (!selectedId) return;
    try { await beneficiaryService.deactivate(selectedId); notify('Beneficiario desactivado correctamente.'); setConfirmOpen(false); loadData(page, search, statusFilter); }
    catch { notifyError('Error al desactivar beneficiario.'); }
  };
  const reactivate = async (id: number) => {
    try { await beneficiaryService.reactivate(id); notify('Beneficiario reactivado correctamente.'); loadData(page, search, statusFilter); }
    catch { notifyError('Error al reactivar beneficiario.'); }
  };

  return (
    <>
      <PageHeader title="Beneficiarios" subtitle="Gestión de beneficiarios registrados"
        actions={canManageBeneficiaries ? (<Link to="/beneficiarios/nuevo"><Button><FontAwesomeIcon icon={faUserPlus} className="mr-2" />Nuevo beneficiario</Button></Link>) : undefined} />

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex-1 min-w-[200px]" onKeyDown={e => e.key === 'Enter' && onSearch()}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, código o documento..." />
        </div>
        <select value={statusFilter} onChange={e => onFilterChange(e.target.value)} className="py-2.5 px-4 bg-white border border-gray-200 rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none cursor-pointer">
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (<Loader message="Cargando beneficiarios..." />) : beneficiaries.length === 0 ? (
        <EmptyState icon={faInbox} title="No se encontraron beneficiarios" message="Intenta con otros filtros o registra un nuevo beneficiario." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Edad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Sexo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Registrado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
              </tr></thead>
              <tbody>{beneficiaries.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{b.internalCode}</code></td>
                  <td className="px-4 py-3 text-sm"><Link to={`/beneficiarios/${b.id}`} className="text-primary-700 hover:text-primary-800 font-medium no-underline hover:underline">{b.fullName}</Link></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.age} años</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.sex}</td>
                  <td className="px-4 py-3 text-sm"><Badge variant={getStatusVariant(b.status)}>{b.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(b.registeredAt)}</td>
                  <td className="px-4 py-3 text-sm"><div className="flex gap-1">
                    <Link to={`/beneficiarios/${b.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors no-underline" title="Ver"><FontAwesomeIcon icon={faEye} /></Link>
                    {canManageBeneficiaries && (<>
                      <Link to={`/beneficiarios/${b.id}/editar`} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors no-underline" title="Editar"><FontAwesomeIcon icon={faPen} /></Link>
                      {b.status === 'Activo' ? (
                        <button onClick={() => confirmDeactivate(b)} className="p-1.5 rounded-lg hover:bg-danger-50 text-text-secondary hover:text-danger-500 transition-colors cursor-pointer border-none bg-transparent" title="Desactivar"><FontAwesomeIcon icon={faBan} /></button>
                      ) : (
                        <button onClick={() => reactivate(b.id)} className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary-600 transition-colors cursor-pointer border-none bg-transparent" title="Reactivar"><FontAwesomeIcon icon={faCircleCheck} /></button>
                      )}
                    </>)}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="px-2 py-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        </div>
      )}
      <ConfirmDialog open={confirmOpen} title="Desactivar beneficiario" message={`¿Está seguro de desactivar a ${selectedName}?`} confirmText="Desactivar" onConfirm={deactivate} onCancel={() => setConfirmOpen(false)} />
    </>
  );
}
