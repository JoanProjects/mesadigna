export interface HealthProfileResponse {
  id: number;
  beneficiaryId: number;
  medicalConditions: string | null;
  dietaryRestrictions: string | null;
  allergies: string | null;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  specialConditions: string | null;
  nutritionalNotes: string | null;
  additionalNotes: string | null;
  hasDietaryConsiderations: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpsertHealthProfileRequest {
  medicalConditions?: string | null;
  dietaryRestrictions?: string | null;
  allergies?: string | null;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  specialConditions?: string | null;
  nutritionalNotes?: string | null;
  additionalNotes?: string | null;
}
