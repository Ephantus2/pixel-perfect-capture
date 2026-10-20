export type AssessmentType = "CAT" | "ASSIGNMENT";
export type AssessmentMode = "PHYSICAL" | "ONLINE";

export interface Assessment {
  id: number;
  course?: number | string | null;
  course_code?: string | null;
  title: string;
  description?: string | null;
  assessment_type: AssessmentType;
  assessment_mode?: AssessmentMode;
  total_marks: number;
  due_date: string;
  [key: string]: unknown;
}

export interface AssessmentPayload {
  course: number;
  title: string;
  description: string;
  assessment_type: AssessmentType;
  assessment_mode: AssessmentMode;
  total_marks: number;
  due_date: string;
}
