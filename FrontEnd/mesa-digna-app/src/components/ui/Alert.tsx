import { cn } from '@/utils/cn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faTriangleExclamation, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';

interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: ReactNode;
}

const styles: Record<string, string> = {
  success: 'bg-success-50 border-success-200 text-success-600',
  warning: 'bg-warning-50 border-warning-200 text-warning-500',
  error: 'bg-danger-50 border-danger-200 text-danger-500',
  info: 'bg-primary-50 border-primary-200 text-primary-500',
};

const icons = { success: faCircleCheck, warning: faTriangleExclamation, error: faCircleExclamation, info: faCircleInfo };

export function Alert({ variant = 'info', title, children }: AlertProps) {
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-lg border', styles[variant])} role="alert">
      <FontAwesomeIcon icon={icons[variant]} className="text-lg mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}
