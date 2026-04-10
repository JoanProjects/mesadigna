import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'active' | 'inactive' | 'suspended' | 'info' | 'warning' | 'role' | 'danger' | 'success';
  children: ReactNode;
}

const variants: Record<string, string> = {
  active: 'bg-success-100 text-success-600 border-success-200',
  inactive: 'bg-danger-100 text-danger-500 border-danger-200',
  suspended: 'bg-warning-100 text-warning-500 border-warning-200',
  info: 'bg-primary-50 text-primary-500 border-primary-200',
  warning: 'bg-warning-100 text-warning-500 border-warning-200',
  role: 'bg-accent-50 text-accent-500 border-accent-200',
  danger: 'bg-danger-100 text-danger-500 border-danger-200',
  success: 'bg-success-100 text-success-600 border-success-200',
};

export function Badge({ variant = 'info', children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', variants[variant])}>
      {children}
    </span>
  );
}
