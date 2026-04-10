import { httpGet, httpPost, httpPut } from '@/services/http/client';
import type { PortionPredictionResponse, GeneratePredictionRequest } from '../types/prediction.types';

const BASE = '/predictions';

export const predictionService = {
  generate(data: GeneratePredictionRequest) {
    return httpPost<PortionPredictionResponse>(`${BASE}/generate`, data);
  },

  getByDate(date: string) {
    return httpGet<PortionPredictionResponse[]>(`${BASE}/by-date`, { date });
  },

  getLatest(date: string) {
    return httpGet<PortionPredictionResponse>(`${BASE}/latest`, { date });
  },

  updateActualAttendance(date: string, count: number) {
    const params = `?date=${encodeURIComponent(date)}&count=${encodeURIComponent(count)}`;
    return httpPut<string>(`${BASE}/actual-attendance${params}`);
  },
};
