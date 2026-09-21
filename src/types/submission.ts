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

export interface MySubmissionAssessment {
  id: number;
  title?: string | null;
  assessment_type?: string | null;
  total_marks?: number | null;
  due_date?: string | null;
  course?: { code?: string | null; name?: string | null } | string | number | null;
  [key: string]: unknown;
}

/** Shape returned by GET /assessment/mysubmissions/ (nested assessment + course). */
export interface MySubmission {
  id: number;
  assessment?: MySubmissionAssessment | number | null;
  answer?: string | null;
  file?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

export function submissionCourseCode(submission: MySubmission): string | null {
  const assessment = submission.assessment;
  if (assessment && typeof assessment === "object") {
    const course = assessment.course;
    if (course && typeof course === "object") return course.code ? String(course.code) : null;
    if (course) return String(course);
  }
  return null;
}
