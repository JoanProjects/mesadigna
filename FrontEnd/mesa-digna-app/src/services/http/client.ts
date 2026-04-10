import { ApiError } from './errors';
import type { ApiResponse } from './types';

const TOKEN_KEY = 'mesa_digna_token';
const USER_KEY = 'mesa_digna_user';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function buildQuery(params?: Record<string, string | number | boolean>): string {
  if (!params) return '';
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers as Record<string, string> || {}) },
    });
  } catch {
    throw new ApiError(0, 'Error de conexión. Verifique su red e intente nuevamente.');
  }

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
    throw new ApiError(401, 'Sesión expirada.');
  }

  const json = await response.json();

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, json);
  }

  return json as ApiResponse<T>;
}

export function httpGet<T>(url: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
  return request<T>(`${url}${buildQuery(params)}`);
}

export function httpPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export function httpPut<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export function httpPatch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
}

export function httpDelete<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: 'DELETE' });
}
