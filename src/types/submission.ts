export interface Submission {
  id: number;
  assessment?: number | string | null;
  student?: number | string | null;
  student_name?: string | null;
  answer?: string | null;
  file?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}
