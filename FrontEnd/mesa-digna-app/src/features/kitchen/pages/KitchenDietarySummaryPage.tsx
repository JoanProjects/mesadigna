import { useState, useCallback, useEffect } from 'react';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Loader, SearchInput } from '@/components/ui';
import { kitchenService } from '../services/kitchen.service';
import { DietaryDateFilter } from '../components/DietaryDateFilter';
import { DietaryBeneficiaryTable } from '../components/DietaryBeneficiaryTable';
import type { DietarySummary } from '../types/kitchen.types';

const PAGE_SIZE = 10;

export default function KitchenDietarySummaryPage() {
  usePageTitle('Cocina - Resumen dietario');

  const [summary, setSummary] = useState<DietarySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const loadData = useCallback(async (p: number, start?: string, end?: string, s?: string) => {
    setLoading(true);
    try {
      const res = await kitchenService.getDietarySummary({
        page: p,
        pageSize: PAGE_SIZE,
        startDate: start,
        endDate: end,
        search: s,
      });
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateFilterChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
    loadData(1, start, end, search);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadData(newPage, startDate, endDate, search);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      loadData(1, startDate, endDate, search);
    }
  };

  const subtitle = startDate
    ? `${summary?.totalBeneficiariesWithRestrictions || 0} beneficiarios con restricciones (filtrado por asistencia)`
    : `${summary?.totalBeneficiariesWithRestrictions || 0} beneficiarios con restricciones alimentarias`;

  return (
    <>
      <PageHeader title="Resumen dietario" subtitle={subtitle} />

      <div className="space-y-4 mb-4">
        <DietaryDateFilter onFilterChange={handleDateFilterChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatsCard
            icon={faUtensils}
            value={summary?.totalBeneficiariesWithRestrictions || 0}
            label="Total con restricciones"
            color="bg-accent-50 text-accent-400"
          />
          <div onKeyDown={handleSearchKeyDown}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre o código (Enter)..."
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader message="Cargando resumen dietario..." />
      ) : (
        <DietaryBeneficiaryTable
          beneficiaries={summary?.beneficiaries.items || []}
          page={page}
          totalPages={summary?.beneficiaries.totalPages || 0}
          totalCount={summary?.beneficiaries.totalCount || 0}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}