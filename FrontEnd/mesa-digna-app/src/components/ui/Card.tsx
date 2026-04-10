import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
  children: ReactNode;
}

export function Card({ title, subtitle, noPadding, children }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
