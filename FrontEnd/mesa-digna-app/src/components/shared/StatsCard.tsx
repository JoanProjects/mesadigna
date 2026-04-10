import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface StatsCardProps {
  icon: IconDefinition;
  value: number | string;
  label: string;
  color?: string; // e.g. 'bg-primary-100 text-primary-700'
}

export function StatsCard({ icon, value, label, color = 'bg-primary-100 text-primary-700' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-text-primary leading-none mb-0.5">{value}</h3>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}
