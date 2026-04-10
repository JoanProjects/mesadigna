import { httpGet, httpPut } from '@/services/http/client';
import type { HealthProfileResponse, UpsertHealthProfileRequest } from '../types/healthProfile.types';

export const healthProfileService = {
  getByBeneficiary(beneficiaryId: number) {
    return httpGet<HealthProfileResponse>(`/beneficiaries/${beneficiaryId}/health-profile`);
  },

  upsert(beneficiaryId: number, data: UpsertHealthProfileRequest) {
    return httpPut<HealthProfileResponse>(`/beneficiaries/${beneficiaryId}/health-profile`, data);
  },
};
