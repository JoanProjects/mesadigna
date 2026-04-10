import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUtensils, faListCheck, faCircleCheck, faCircleXmark, faInbox } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatsCard } from '@/components/shared/StatsCard';
import { Loader, Badge, Card, EmptyState } from '@/components/ui';
import { kitchenService } from '../services/kitchen.service';
import { todayISO } from '@/utils/formatDate';
import type { DailyOperationalSummary } from '../types/kitchen.types';

export default function KitchenOperationalSummaryPage() {
  usePageTitle('Cocina - Resumen operacional');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [summary, setSummary] = useState<DailyOperationalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (date: string) => {
    setLoading(true);
    try {
      const res = await kitchenService.getOperationalSummary(date);
      if (res.success && res.data) setSummary(res.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { loadData(selectedDate); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const onDateChange = (date: string) => { setSelectedDate(date); loadData(date); };

  if (loading) return <Loader message="Cargando resumen operacional..." />;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Resumen operacional</h1>
          <p className="text-sm text-text-secondary mt-1">Detalle de preparaciones y requerimientos de ingredientes</p>
        </div>
        <input type="date" value={selectedDate} onChange={e => onDateChange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard icon={faUsers} value={summary.totalAttendees} label="Asistentes" color="bg-primary-50 text-primary-500" />
            <StatsCard icon={faUtensils} value={summary.totalServingsPlanned} label="Porciones planificadas" color="bg-accent-50 text-accent-400" />
            <StatsCard icon={faListCheck} value={summary.totalPreparations} label="Preparaciones" color="bg-warning-50 text-warning-500" />
          </div>

          {summary.preparations.length > 0 && (
            <Card title="Preparaciones">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Comida</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Tipo dieta</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Porciones est.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Estado</th>
                  </tr></thead>
                  <tbody>{summary.preparations.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{p.mealName}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{p.dietType}</td>
                      <td className="px-4 py-3 text-sm">{p.estimatedServings}</td>
                      <td className="px-4 py-3 text-sm"><Badge variant="info">{p.status}</Badge></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}

          {summary.ingredientRequirements.length > 0 && (
            <Card title="Requerimientos de ingredientes">
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Ingrediente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Requerido</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Stock actual</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Estado</th>
                  </tr></thead>
                  <tbody>{summary.ingredientRequirements.map(ir => (
                    <tr key={ir.ingredientId} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{ir.ingredientName}</td>
                      <td className="px-4 py-3 text-sm">{ir.totalQuantityRequired} {ir.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-sm">{ir.currentStock} {ir.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-sm">
                        {ir.isSufficient ? (
                          <span className="inline-flex items-center gap-1 text-primary-600"><FontAwesomeIcon icon={faCircleCheck} /> Suficiente</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-danger-500"><FontAwesomeIcon icon={faCircleXmark} /> Insuficiente</span>
                        )}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}

          {summary.preparations.length === 0 && summary.ingredientRequirements.length === 0 && (
            <EmptyState icon={faInbox} title="Sin datos operacionales" message="No hay preparaciones planificadas para esta fecha." />
          )}
        </>
      )}
    </>
  );
}
