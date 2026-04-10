import { useState, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { Loader, Badge, EmptyState, Card } from '@/components/ui';
import { kitchenService } from '../services/kitchen.service';
import type { DietarySummary } from '../types/kitchen.types';

export default function KitchenDietarySummaryPage() {
  usePageTitle('Cocina - Resumen dietario');
  const [summary, setSummary] = useState<DietarySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kitchenService.getDietarySummary().then(res => {
      if (res.success && res.data) setSummary(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Cargando resumen dietario..." />;

  return (
    <>
      <PageHeader title="Resumen dietario" subtitle={`${summary?.totalBeneficiariesWithRestrictions || 0} beneficiarios con restricciones alimentarias`} />
      {!summary || summary.beneficiaries.length === 0 ? (
        <EmptyState icon={faInbox} title="Sin restricciones" message="No hay beneficiarios con restricciones dietéticas registradas." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Restricciones</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Alergias</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Condiciones</th>
              </tr></thead>
              <tbody>{summary.beneficiaries.map(b => (
                <tr key={b.beneficiaryId} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{b.fullName}</td>
                  <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{b.internalCode}</code></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.dietaryRestrictions || '—'}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.allergies || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {b.hasHypertension && <Badge variant="warning">Hipertensión</Badge>}
                      {b.hasDiabetes && <Badge variant="warning">Diabetes</Badge>}
                      {b.specialConditions && b.specialConditions !== 'Ninguna' && <Badge variant="info">{b.specialConditions}</Badge>}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
