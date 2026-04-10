import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faEye, faArrowRight, faInbox } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatsCard } from '@/components/shared/StatsCard';
import { Loader, Badge, Modal, SearchInput, Pagination, EmptyState, Button } from '@/components/ui';
import { kitchenService } from '../services/kitchen.service';
import { todayISO } from '@/utils/formatDate';
import type { DailyKitchenSummary, DietCategoryBeneficiary } from '../types/kitchen.types';

export default function KitchenDailySummaryPage() {
  usePageTitle('Cocina - Resumen diario');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [summary, setSummary] = useState<DailyKitchenSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalCategoryKey, setModalCategoryKey] = useState('');
  const [modalBeneficiaries, setModalBeneficiaries] = useState<DietCategoryBeneficiary[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(0);
  const [modalTotalCount, setModalTotalCount] = useState(0);

  const filteredModal = useMemo(() => {
    const s = modalSearch.toLowerCase().trim();
    if (!s) return modalBeneficiaries;
    return modalBeneficiaries.filter(b => b.fullName.toLowerCase().includes(s) || b.internalCode.toLowerCase().includes(s));
  }, [modalBeneficiaries, modalSearch]);

  const loadData = async (date: string) => {
    setLoading(true);
    try {
      const res = await kitchenService.getDailySummary(date);
      if (res.success && res.data) setSummary(res.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { loadData(selectedDate); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDateChange = (date: string) => { setSelectedDate(date); loadData(date); };

  const fetchModalPage = async (page: number) => {
    setModalLoading(true);
    try {
      const res = await kitchenService.getBeneficiariesByCategory(selectedDate, modalCategoryKey, page, 50);
      if (res.success && res.data) {
        setModalBeneficiaries(res.data.items);
        setModalPage(res.data.page);
        setModalTotalPages(res.data.totalPages);
        setModalTotalCount(res.data.totalCount);
      }
    } catch { /* silent */ }
    setModalLoading(false);
  };

  const openModal = (category: string, categoryKey: string) => {
    setModalCategory(category); setModalCategoryKey(categoryKey);
    setModalBeneficiaries([]); setModalSearch('');
    setModalPage(1); setModalTotalPages(0); setModalTotalCount(0);
    setModalOpen(true);
    fetchModalPage(1);
  };

  const closeModal = () => setModalOpen(false);

  if (loading) return <Loader message="Cargando resumen..." />;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Resumen diario de cocina</h1>
          <p className="text-sm text-text-secondary mt-1">Desglose de porciones por categoría dietética</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" value={selectedDate} onChange={e => onDateChange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          <Link to="/cocina/dietario"><Button variant="secondary" size="sm">Dietario <FontAwesomeIcon icon={faArrowRight} className="ml-1" /></Button></Link>
          <Link to="/cocina/operacional"><Button variant="secondary" size="sm">Operacional <FontAwesomeIcon icon={faArrowRight} className="ml-1" /></Button></Link>
        </div>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard icon={faUtensils} value={summary.totalServings} label="Total porciones" color="bg-primary-50 text-primary-500" />
            <StatsCard icon={faUtensils} value={summary.regularServings} label="Porciones regulares" color="bg-accent-50 text-accent-400" />
            <StatsCard icon={faUtensils} value={summary.specialDietServings} label="Porciones especiales" color="bg-warning-50 text-warning-500" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Cantidad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Acciones</th>
                </tr></thead>
                <tbody>
                  {summary.dietCategories.map(cat => (
                    <tr key={cat.categoryKey} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">{cat.category}</td>
                      <td className="px-4 py-3 text-sm"><Badge variant="info">{cat.count}</Badge></td>
                      <td className="px-4 py-3 text-sm">
                        <button onClick={() => openModal(cat.category, cat.categoryKey)} className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 cursor-pointer bg-transparent border-none font-medium">
                          <FontAwesomeIcon icon={faEye} /> Ver beneficiarios
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={`Beneficiarios — ${modalCategory}`}>
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 mb-3">
            <SearchInput value={modalSearch} onChange={setModalSearch} placeholder="Buscar por nombre o código..." />
            {modalTotalCount > 0 && <p className="text-xs text-text-light mt-1">{modalTotalCount} beneficiarios</p>}
          </div>
          <div className="flex-1 overflow-y-auto">
            {modalLoading ? <Loader message="Cargando..." /> : filteredModal.length === 0 ? (
              <EmptyState icon={faInbox} title="Sin beneficiarios" message="No hay beneficiarios en esta categoría." />
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary uppercase">Código</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-text-secondary uppercase">Nombre</th>
                </tr></thead>
                <tbody>{filteredModal.map(b => (
                  <tr key={b.beneficiaryId} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-sm"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{b.internalCode}</code></td>
                    <td className="px-3 py-2 text-sm text-text-primary">{b.fullName}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
          {modalTotalPages > 1 && (
            <div className="flex-shrink-0 pt-3 border-t border-gray-100">
              <Pagination page={modalPage} totalPages={modalTotalPages} onPageChange={p => fetchModalPage(p)} />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
