export interface Grade {
  id: number;
  submission?: number | string | null;
  marks: number | string | null;
  feedback?: string | null;
  graded_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface GradePayload {
  submission: number;
  marks: number;
  feedback: string;
}
