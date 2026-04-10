export interface PortionPredictionResponse {
  id: number;
  predictionDate: string;
  recommendedPortions: number;
  regularPortions: number;
  specialDietPortions: number;
  modelConfidence: number;
  modelName: string;
  modelVersion: string;
  generatedAt: string;
  dietaryBreakdown: string | null;
  actualAttendance: number | null;
  accuracyScore: number | null;
  inputSnapshot: PredictionInputSnapshot;
}

export interface PredictionInputSnapshot {
  dayOfWeek: string;
  totalActiveBeneficiaries: number;
  elderlyCount: number;
  minorsCount: number;
  dietaryRestrictionsCount: number;
  hypertensionCount: number;
  diabetesCount: number;
  previousDayAttendance: number;
  attendanceLast7DaysAvg: number;
  attendanceLast30DaysAvg: number;
}

export interface GeneratePredictionRequest {
  targetDate: string;
}
