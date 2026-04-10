import { httpGet, httpPost } from '@/services/http/client';
import type { AttendanceResponse, CheckInRequest, DailySummaryResponse } from '../types/attendance.types';

const BASE = '/attendances';

export const attendanceService = {
  checkIn(data: CheckInRequest) {
    return httpPost<AttendanceResponse>(`${BASE}/check-in`, data);
  },

  getByDate(date: string) {
    return httpGet<AttendanceResponse[]>(`${BASE}/by-date`, { date });
  },

  getByRange(from: string, to: string) {
    return httpGet<AttendanceResponse[]>(`${BASE}/by-range`, { from, to });
  },

  getDailySummary(date: string) {
    return httpGet<DailySummaryResponse>(`${BASE}/summary-daily`, { date });
  },
};
