export interface LecturerRef {
  id?: number;
  user?: {
    id?: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  [key: string]: unknown;
}

export interface ProgrammeRef {
  id?: number;
  name?: string | null;
  code?: string | null;
  [key: string]: unknown;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  lecturer?: number | string | LecturerRef | null;
  lecturer_name?: string | null;
  programme?: number | string | ProgrammeRef | null;
  programme_name?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

function str(value: unknown) {
  if (value == null || value === "") return null;
  return String(value);
}

/** Handles both flat (`lecturer_name`) and nested (`lecturer.user`) API shapes. */
export function courseLecturerName(course: Course): string | null {
  if (str(course.lecturer_name)) return str(course.lecturer_name);
  const lecturer = course.lecturer;
  if (lecturer && typeof lecturer === "object") {
    const user = (lecturer as LecturerRef).user;
    const full = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
    return full || str(user?.email) || null;
  }
  return str(lecturer);
}

/** Handles both flat (`programme_name`) and nested (`programme.name`) API shapes. */
export function courseProgrammeName(course: Course): string | null {
  if (str(course.programme_name)) return str(course.programme_name);
  const programme = course.programme;
  if (programme && typeof programme === "object") {
    const p = programme as ProgrammeRef;
    const name = str(p.name);
    const code = str(p.code);
    if (name && code) return `${name} (${code})`;
    return name ?? code;
  }
  return str(programme);
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
