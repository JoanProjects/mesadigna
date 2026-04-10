import { useState } from 'react';
import { todayISO } from '@/utils/formatDate';
import type { DateRangePreset } from '../types/kitchen.types';

interface DietaryDateFilterProps {
  onFilterChange: (startDate?: string, endDate?: string) => void;
}

const presets: { key: DateRangePreset; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
  { key: 'last7days', label: 'Últimos 7 días' },
  { key: 'thisMonth', label: 'Este mes' },
  { key: 'custom', label: 'Personalizado' },
];

function getPresetDates(preset: DateRangePreset): { startDate?: string; endDate?: string } {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'all':
      return {};
    case 'today':
      return { startDate: iso(today), endDate: iso(today) };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return { startDate: iso(yesterday), endDate: iso(yesterday) };
    }
    case 'last7days': {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      return { startDate: iso(weekAgo), endDate: iso(today) };
    }
    case 'thisMonth': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: iso(firstDay), endDate: iso(today) };
    }
    default:
      return {};
  }
}

export function DietaryDateFilter({ onFilterChange }: DietaryDateFilterProps) {
  const [activePreset, setActivePreset] = useState<DateRangePreset>('all');
  const [customStart, setCustomStart] = useState(todayISO());
  const [customEnd, setCustomEnd] = useState(todayISO());

  const handlePresetClick = (preset: DateRangePreset) => {
    setActivePreset(preset);
    if (preset !== 'custom') {
      const { startDate, endDate } = getPresetDates(preset);
      onFilterChange(startDate, endDate);
    } else {
      if (customStart && customEnd && customStart <= customEnd) {
        onFilterChange(customStart, customEnd);
      }
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    if (start && end && start <= end) {
      onFilterChange(start, end);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
        {presets.map(p => (
          <button
            key={p.key}
            onClick={() => handlePresetClick(p.key)}
            className={`px-3 py-1.5 text-xs rounded-md cursor-pointer border-0 transition-colors ${
              activePreset === p.key
                ? 'bg-white shadow-sm text-text-primary font-semibold'
                : 'text-text-secondary bg-transparent hover:text-text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activePreset === 'custom' && (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="date"
            value={customStart}
            onChange={e => handleCustomDateChange(e.target.value, customEnd)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <span className="text-text-secondary text-sm">a</span>
          <input
            type="date"
            value={customEnd}
            onChange={e => handleCustomDateChange(customStart, e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          {customStart && customEnd && customStart > customEnd && (
            <span className="text-red-500 text-xs">La fecha inicial debe ser anterior a la final</span>
          )}
        </div>
      )}

      {activePreset !== 'all' && (
        <p className="text-xs text-text-light">
          Mostrando beneficiarios con restricciones que tuvieron asistencia en el rango seleccionado.
        </p>
      )}
    </div>
  );
}
