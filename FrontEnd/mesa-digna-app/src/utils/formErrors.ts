import { ApiError } from '@/services/http/errors';

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !error.fieldErrors) return {};
  const mapped: Record<string, string> = {};
  for (const [key, messages] of Object.entries(error.fieldErrors)) {
    mapped[toCamelCase(key)] = messages[0] || 'Error de validación.';
  }
  return mapped;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Error inesperado.';
}
