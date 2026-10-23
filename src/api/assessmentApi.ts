import api from "./axios";
import { toArray } from "./courseApi";
import type { Assessment, AssessmentPayload } from "@/types/assessment";
import type { MySubmission, Submission } from "@/types/submission";
import type { Grade, GradePayload } from "@/types/grade";

export async function createAssessment(payload: AssessmentPayload) {
  const { data } = await api.post("/assessment/create/assessment/", payload);
  return data;
}

export async function updateAssessment(id: number, payload: Partial<AssessmentPayload>) {
  const { data } = await api.put(`/assessment/update/assessment/${id}/`, payload);
  return data;
}

export async function deleteAssessment(id: number) {
  const { data } = await api.delete(`/assessment/update/assessment/${id}/`);
  return data;
}

export async function fetchCourseAssessments(courseCode: string) {
  const { data } = await api.get(`/assessment/course/assessments/${courseCode}/`);
  return toArray<Assessment>(data);
}

export async function createSubmission(input: {
  assessment: number;
  answer?: string;
  file?: File | null;
}) {
  const formData = new FormData();
  formData.append("assessment", String(input.assessment));
  if (input.answer) formData.append("answer", input.answer);
  if (input.file) formData.append("file", input.file);
  const { data } = await api.post("/assessment/create/submission/", formData);
  return data;
}

export async function updateSubmission(
  id: number,
  input: { answer?: string; file?: File | null },
) {
  const formData = new FormData();
  if (input.answer !== undefined) formData.append("answer", input.answer);
  if (input.file) formData.append("file", input.file);
  const { data } = await api.put(`/assessment/update/submission/${id}/`, formData);
  return data;
}

export async function deleteSubmission(id: number) {
  const { data } = await api.delete(`/assessment/update/submission/${id}/`);
  return data;
}

export async function fetchAssessmentSubmissions(assessmentId: number) {
  const { data } = await api.get(`/assessment/submissions/${assessmentId}/`);
  return toArray<Submission>(data);
}

/** Submissions made by the signed-in student. */
export async function fetchMySubmissions() {
  const { data } = await api.get("/assessment/mysubmissions/");
  return toArray<MySubmission>(data);
}

export async function createGrade(payload: GradePayload) {
  const { data } = await api.post<Grade>("/assessment/create/grade/", payload);
  return data;
}

export async function updateGrade(id: number, payload: GradePayload) {
  const { data } = await api.put<Grade | { grade: Grade }>(`/assessment/update/grade/${id}/`, payload);
  return "grade" in data && data.grade && typeof data.grade === "object" ? data.grade as Grade : data as Grade;
}

export async function uploadBulkMarks(assessmentId: number, payload: { marks: { registration_number: string; marks: string }[] }) {
  const { data } = await api.post<{ message: string; assessment: string; students_processed: number }>(`/assessment/assessments/${assessmentId}/marks/bulk/`, payload);
  return data;
}

/** Grade identified by the assessment ID and student ID rather than a submission ID. */
export async function fetchGrade(assessmentId: number, studentId: number) {
  const { data } = await api.get<Grade>(
    `/assessment/assessments/${assessmentId}/students/${studentId}/grade/`,
  );
  return data;
}
