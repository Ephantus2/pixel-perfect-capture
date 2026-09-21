import api from "./axios";
import { toArray } from "./courseApi";
import type { Assessment, AssessmentPayload } from "@/types/assessment";
import type { Submission } from "@/types/submission";
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
  const { data } = await api.post("/assessment/create/grade/", payload);
  return data;
}

export async function updateGrade(id: number, payload: Partial<GradePayload>) {
  const { data } = await api.put(`/assessment/update/grade/${id}/`, payload);
  return data;
}

export async function fetchGrade(submissionId: number) {
  const { data } = await api.get<Grade>(`/assessment/view/grade/${submissionId}/`);
  return data;
}
