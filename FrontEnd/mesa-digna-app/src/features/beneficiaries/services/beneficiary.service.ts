import { httpGet, httpPost, httpPut, httpPatch, httpDelete } from '@/services/http/client';
import type { ApiResponse, PagedResponse } from '@/services/http/types';
import type { BeneficiaryResponse, CreateBeneficiaryRequest, UpdateBeneficiaryRequest, BeneficiaryFilter } from '../types/beneficiary.types';

const BASE = '/beneficiaries';

export const beneficiaryService = {
  getAll(filter: BeneficiaryFilter) {
    return httpGet<PagedResponse<BeneficiaryResponse>>(BASE, {
      page: filter.page,
      pageSize: filter.pageSize,
      ...(filter.search ? { search: filter.search } : {}),
      ...(filter.status ? { status: filter.status } : {}),
    });
  },

  getById(id: number) {
    return httpGet<BeneficiaryResponse>(`${BASE}/${id}`);
  },

  create(data: CreateBeneficiaryRequest) {
    return httpPost<BeneficiaryResponse>(BASE, data);
  },

  update(id: number, data: UpdateBeneficiaryRequest) {
    return httpPut<BeneficiaryResponse>(`${BASE}/${id}`, data);
  },

  deactivate(id: number): Promise<ApiResponse<object>> {
    return httpDelete(`${BASE}/${id}`);
  },

  reactivate(id: number): Promise<ApiResponse<object>> {
    return httpPatch(`${BASE}/${id}/reactivate`, {});
  },
};
