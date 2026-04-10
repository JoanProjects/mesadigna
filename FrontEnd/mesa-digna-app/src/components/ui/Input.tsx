import { cn } from '@/utils/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className, id, disabled, ...props }: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
        <div className="flex flex-col gap-1">
            {label && <label htmlFor={inputId} className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</label>}
            <input
                id={inputId}
                disabled={disabled}
                className={cn(
                    'px-4 py-2.5 border rounded-lg text-sm transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
                    error ? 'border-danger-400' : 'border-gray-200',
                    disabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-100'
                        : 'bg-white text-text-primary',
                    className,
                )}
                {...props}
            />
            {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
    );
}