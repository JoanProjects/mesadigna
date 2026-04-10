export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string | null;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
}
