import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { faUsers, faMars, faVenus, faChild, faInbox, faUserTie, faRestroom, faGenderless } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/app/providers/AuthProvider';
import { StatsCard } from '@/components/shared/StatsCard';
import { Loader, Badge, Pagination, SearchInput, EmptyState } from '@/components/ui';
import { attendanceService } from '../services/attendance.service';
import { todayISO, formatDate, formatTime } from '@/utils/formatDate';
import type { AttendanceResponse, DailySummaryResponse } from '../types/attendance.types';

const PAGE_SIZE = 10;

export default function AttendanceListPage() {
  const { canViewBeneficiaries } = useAuth();
  const [filterMode, setFilterMode] = useState<'date' | 'range'>('date');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate, setToDate] = useState(todayISO());
  const [attendances, setAttendances] = useState<AttendanceResponse[]>([]);
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const loadByDate = async (date: string) => {
    setLoading(true);
    try {
      const [atRes, sumRes] = await Promise.all([
        attendanceService.getByDate(date),
        attendanceService.getDailySummary(date),
      ]);
      if (atRes.success && atRes.data) setAttendances(atRes.data);
      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  const loadByRange = async (from: string, to: string) => {
    setLoading(true);
    setSummary(null);
    try {
      const res = await attendanceService.getByRange(from, to);
      if (res.success && res.data) setAttendances(res.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    loadByDate(selectedDate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDateChange = (date: string) => {
    setSelectedDate(date);
    setPage(1);
    setSearchTerm('');
    loadByDate(date);
  };

  const onRangeChange = () => {
    if (fromDate && toDate && fromDate <= toDate) {
      setPage(1);
      setSearchTerm('');
      loadByRange(fromDate, toDate);
    }
  };

  const switchMode = (mode: 'date' | 'range') => {
    setFilterMode(mode);
    setPage(1);
    setSearchTerm('');
    if (mode === 'date') loadByDate(selectedDate);
    else loadByRange(fromDate, toDate);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return attendances;
    return attendances.filter(a =>
      a.beneficiaryName.toLowerCase().includes(term) ||
      a.beneficiaryInternalCode.toLowerCase().includes(term),
    );
  }, [attendances, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <>
      {/* Filter mode toggle */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => switchMode('date')}
            className={`px-3 py-1.5 text-xs rounded-md cursor-pointer border-0 transition-colors ${filterMode === 'date' ? 'bg-white shadow-sm text-text-primary font-semibold' : 'text-text-secondary bg-transparent'}`}
          >
            Por fecha
          </button>
          <button
            onClick={() => switchMode('range')}
            className={`px-3 py-1.5 text-xs rounded-md cursor-pointer border-0 transition-colors ${filterMode === 'range' ? 'bg-white shadow-sm text-text-primary font-semibold' : 'text-text-secondary bg-transparent'}`}
          >
            Por rango
          </button>
        </div>

        {filterMode === 'date' ? (
          <input
            type="date"
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        ) : (
          <div className="flex gap-2 items-center">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} onBlur={onRangeChange} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            <span className="text-text-secondary text-sm">a</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} onBlur={onRangeChange} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        )}
      </div>

       {/* Summary cards */}
       {filterMode === 'date' && summary && (
         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
           <StatsCard icon={faUsers} value={summary.totalAttendees} label="Total" color="bg-primary-50 text-primary-500" />
           <StatsCard icon={faMars} value={summary.totalMale} label="Masculino" color="bg-blue-50 text-blue-500" />
           <StatsCard icon={faVenus} value={summary.totalFemale} label="Femenino" color="bg-pink-50 text-pink-500" />
           <StatsCard icon={faGenderless} value={summary.totalOther} label="Otros" color="bg-gray-50 text-gray-500" />
           <StatsCard icon={faChild} value={summary.totalMinors} label="Menores" color="bg-accent-50 text-accent-400" />
           <StatsCard icon={faUserTie} value={summary.totalAdults} label="Adultos" color="bg-indigo-50 text-indigo-500" />
           <StatsCard icon={faRestroom} value={summary.totalElders} label="M. Mayores" color="bg-amber-50 text-amber-600" />
         </div>
       )}

      {/* Search */}
      <div className="mb-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o código..." />
      </div>

      {loading ? (
        <Loader message="Cargando registros..." />
      ) : paginated.length === 0 ? (
        <EmptyState icon={faInbox} title="Sin registros" message="No se encontraron registros de asistencia para los filtros seleccionados." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Beneficiario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Hora</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Método</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      {canViewBeneficiaries ? (
                        <Link to={`/beneficiarios/${a.beneficiaryId}`} className="text-primary-700 hover:text-primary-800 font-medium no-underline hover:underline">
                          {a.beneficiaryName}
                        </Link>
                      ) : a.beneficiaryName}
                    </td>
                    <td className="px-4 py-3 text-sm"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{a.beneficiaryInternalCode}</code></td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(a.serviceDate)}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{formatTime(a.checkInTime)}</td>
                    <td className="px-4 py-3 text-sm"><Badge variant="info">{a.checkInMethod}</Badge></td>
                    <td className="px-4 py-3 text-sm text-text-light">{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-2 py-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </>
  );
}