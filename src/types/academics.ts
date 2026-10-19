export interface School {
  id: number;
  name: string;
  code?: string | null;
}

export interface Department {
  id: number;
  name: string;
  code?: string | null;
  school?: School | number | null;
}

export interface Programme {
  id: number;
  name: string;
  code?: string | null;
  department?: Department | number | null;
}

export interface ProfilePayload {
  programme?: number;
  current_year?: number;
  admission_year?: number;
  department?: number;
}

export interface AcademicYear {
  id: number;
  name: string;
  start_year: number;
  end_year: number;
  is_current: boolean;
}

export interface CoursePerformance {
  id: number;
  course_code: string;
  course_name: string;
  academic_year: string;
  total_marks: string | number;
  grade: string | null;
}
