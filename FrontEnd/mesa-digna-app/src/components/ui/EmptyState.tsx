import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface EmptyStateProps {
  icon: IconDefinition;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FontAwesomeIcon icon={icon} className="text-5xl text-text-light mb-4" />
      <h3 className="text-lg font-semibold text-text-secondary mb-1">{title}</h3>
      {message && <p className="text-sm text-text-light max-w-xs">{message}</p>}
    </div>
  );
}
