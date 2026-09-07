export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  lecturer?: number | string | null;
  lecturer_name?: string | null;
  programme?: number | string | null;
  programme_name?: string | null;
  [key: string]: unknown;
}

export interface CoursePayload {
  code: string;
  name: string;
  lecturer: number;
  programme: number;
  description: string;
}

export interface CourseMaterial {
  id: number;
  title: string;
  file?: string | null;
  course?: number | string | null;
  uploaded_at?: string | null;
  [key: string]: unknown;
}

export interface CourseStatistics {
  [key: string]: unknown;
}
