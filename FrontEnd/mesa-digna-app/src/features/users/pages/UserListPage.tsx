import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faToggleOn, faToggleOff, faUserPlus, faInbox } from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '@/app/providers/NotificationProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { Loader, Badge, Pagination, EmptyState, Button } from '@/components/ui';
import { userService } from '../services/user.service';
import type { UserResponse } from '@/features/auth/types/auth.types';

export default function UserListPage() {
  usePageTitle('Usuarios');
  const { success: notify, error: notifyError } = useNotification();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const loadData = useCallback(async (p: number, sf: 'all' | 'active' | 'inactive') => {
    setLoading(true);
    try {
      const res = await userService.getAll(p, 10, sf);
      if (res.success && res.data) { setUsers(res.data.items); setTotalPages(res.data.totalPages); }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(1, 'all'); }, [loadData]);
  const onFilterChange = (sf: 'all' | 'active' | 'inactive') => { setStatusFilter(sf); setPage(1); loadData(1, sf); };
  const onPageChange = (p: number) => { setPage(p); loadData(p, statusFilter); };

  const toggleStatus = async (u: UserResponse) => {
    try {
      await userService.setStatus(u.id, !u.isActive);
      notify(`Usuario ${u.isActive ? 'desactivado' : 'activado'} correctamente.`);
      loadData(page, statusFilter);
    } catch { notifyError('Error al cambiar estado.'); }
  };

  return (
    <>
      <PageHeader title="Usuarios" subtitle="Gestión de usuarios del sistema"
        actions={<Link to="/usuarios/nuevo"><Button><FontAwesomeIcon icon={faUserPlus} className="mr-2" />Nuevo usuario</Button></Link>} />
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button key={f} onClick={() => onFilterChange(f)}
            className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer border transition-colors ${statusFilter === f ? 'bg-primary-100 border-primary-300 text-primary-800 font-semibold' : 'bg-white border-gray-200 text-text-secondary hover:bg-gray-50'}`}>
            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>
      {loading ? <Loader message="Cargando usuarios..." /> : users.length === 0 ? (
        <EmptyState icon={faInbox} title="Sin usuarios" message="No se encontraron usuarios." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
            </tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{u.fullName}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{u.email}</td>
                <td className="px-4 py-3 text-sm"><Badge variant="info">{u.role}</Badge></td>
                <td className="px-4 py-3 text-sm"><Badge variant={u.isActive ? 'active' : 'inactive'}>{u.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                <td className="px-4 py-3 text-sm"><div className="flex gap-1">
                  <Link to={`/usuarios/${u.id}/editar`} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors no-underline" title="Editar"><FontAwesomeIcon icon={faPen} /></Link>
                  <button onClick={() => toggleStatus(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary-700 transition-colors cursor-pointer border-none bg-transparent" title={u.isActive ? 'Desactivar' : 'Activar'}>
                    <FontAwesomeIcon icon={u.isActive ? faToggleOn : faToggleOff} />
                  </button>
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
