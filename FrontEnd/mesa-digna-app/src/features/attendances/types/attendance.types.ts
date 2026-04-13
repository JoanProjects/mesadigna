export interface AttendanceResponse {
  id: number;
  beneficiaryId: number;
  beneficiaryName: string;
  beneficiaryInternalCode: string;
  serviceDate: string;
  checkInTime: string;
  checkInMethod: string;
  notes: string | null;
}

export interface CheckInRequest {
  beneficiaryId?: number;
  internalCode?: string;
  checkInMethod: string;
  notes?: string;
}

export interface DailySummaryResponse {
  date: string;
  totalAttendees: number;
  totalMale: number;
  totalFemale: number;
  totalOther: number;
  totalMinors: number;
  totalAdults: number;
  totalElders: number;
}
