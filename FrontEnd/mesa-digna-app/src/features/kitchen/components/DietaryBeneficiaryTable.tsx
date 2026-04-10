import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { Badge, EmptyState, Pagination } from '@/components/ui';
import type { DietaryBeneficiary } from '../types/kitchen.types';

interface DietaryBeneficiaryTableProps {
  beneficiaries: DietaryBeneficiary[];
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function DietaryBeneficiaryTable({
  beneficiaries,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: DietaryBeneficiaryTableProps) {
  if (beneficiaries.length === 0) {
    return (
      <EmptyState
        icon={faInbox}
        title="Sin restricciones"
        message="No hay beneficiarios con restricciones dietéticas para los filtros seleccionados."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Restricciones</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Alergias</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Condiciones</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map(b => (
              <tr key={b.beneficiaryId} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{b.fullName}</td>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{b.internalCode}</code>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{b.dietaryRestrictions || '—'}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{b.allergies || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-1 flex-wrap">
                    {b.hasHypertension && <Badge variant="warning">Hipertensión</Badge>}
                    {b.hasDiabetes && <Badge variant="warning">Diabetes</Badge>}
                    {b.specialConditions && b.specialConditions !== 'Ninguna' && (
                      <Badge variant="info">{b.specialConditions}</Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center py-4 border-t border-gray-100">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        <span className="text-xs text-text-light ml-4">{totalCount} registros</span>
      </div>
    </div>
  );
}
