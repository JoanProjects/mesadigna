import { httpGet, httpPost, httpPut, httpPatch } from '@/services/http/client';
import type { ApiResponse, PagedResponse } from '@/services/http/types';
import type { UserResponse } from '@/features/auth/types/auth.types';
import type { CreateUserRequest, UpdateUserRequest } from '../types/user.types';

const BASE = '/users';

export const userService = {
  getAll(page: number, pageSize: number, statusFilter?: 'all' | 'active' | 'inactive') {
    const params: Record<string, string | number> = { page, pageSize };
    if (statusFilter === 'active') params.isActive = 'true';
    else if (statusFilter === 'inactive') params.isActive = 'false';
    return httpGet<PagedResponse<UserResponse>>(BASE, params);
  },

  getById(id: number) {
    return httpGet<UserResponse>(`${BASE}/${id}`);
  },

  create(data: CreateUserRequest) {
    return httpPost<UserResponse>(BASE, data);
  },

  update(id: number, data: UpdateUserRequest) {
    return httpPut<UserResponse>(`${BASE}/${id}`, data);
  },

  setStatus(id: number, isActive: boolean): Promise<ApiResponse<object>> {
    return httpPatch(`${BASE}/${id}/status`, { isActive });
  },

  setRole(id: number, role: string): Promise<ApiResponse<object>> {
    return httpPatch(`${BASE}/${id}/role`, { role });
  },
};
