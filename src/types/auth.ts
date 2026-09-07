export type Role = "STUDENT" | "LECTURER" | "ADMIN";

export interface CurrentUser {
  id: number;
  login_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  /** Student only */
  programme?: string;
  current_year?: number;
  admission_year?: number;
  /** Lecturer only */
  department?: string;
}

export interface LoginPayload {
  login_id: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: number;
  role: Role;
}

export interface RegisterPayload {
  login_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}
