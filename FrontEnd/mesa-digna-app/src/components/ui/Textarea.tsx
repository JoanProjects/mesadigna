import { cn } from '@/utils/cn';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={textareaId} className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</label>}
      <textarea
        id={textareaId}
        className={cn(
          'px-4 py-2.5 bg-white border rounded-lg text-sm text-text-primary transition-all resize-y min-h-[80px]',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          error ? 'border-danger-400' : 'border-gray-200',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
