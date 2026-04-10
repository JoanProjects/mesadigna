export interface BeneficiaryResponse {
  id: number;
  internalCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  sex: string;
  identityDocument: string | null;
  phoneNumber: string | null;
  address: string | null;
  emergencyContact: string | null;
  status: string;
  notes: string | null;
  registeredAt: string;
  createdAt: string;
}

export interface CreateBeneficiaryRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  identityDocument?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
}

export interface UpdateBeneficiaryRequest extends CreateBeneficiaryRequest {
  status: string;
}

export interface BeneficiaryFilter {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}
