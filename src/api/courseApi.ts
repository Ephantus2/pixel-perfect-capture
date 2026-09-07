import api from "./axios";
import type { Course, CourseMaterial, CoursePayload, CourseStatistics } from "@/types/course";

/** Normalizes DRF list/paginated responses into an array. */
export function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}

export async function createCourse(payload: CoursePayload) {
  const { data } = await api.post("/courses/create/course/", payload);
  return data;
}

export async function updateCourse(id: number, payload: Partial<CoursePayload>) {
  const { data } = await api.put(`/courses/update/course/${id}/`, payload);
  return data;
}

export async function deleteCourse(id: number) {
  const { data } = await api.delete(`/courses/update/course/${id}/`);
  return data;
}

export async function enrollCourse(course_code: string) {
  const { data } = await api.post<{ message?: string; Error?: string }>(
    "/courses/enroll/course/",
    { course_code },
  );
  return data;
}

export async function unenrollCourse(course_code: string) {
  const { data } = await api.post<{ message?: string; Error?: string }>(
    "/courses/unenroll/course/",
    { course_code },
  );
  return data;
}

export async function fetchEnrolledCourses() {
  const { data } = await api.get("/courses/enrolled/units/");
  return toArray<Course>(data);
}

export async function fetchCourseMaterials(courseCode: string) {
  const { data } = await api.get(`/courses/course/materials/${courseCode}/`);
  return toArray<CourseMaterial>(data);
}

export async function uploadMaterial(input: { course: string; title: string; file: File }) {
  const formData = new FormData();
  formData.append("course", input.course);
  formData.append("title", input.title);
  formData.append("file", input.file);
  const { data } = await api.post("/courses/create/materials/", formData);
  return data;
}

export async function updateMaterial(
  id: number,
  input: { course?: string; title?: string; file?: File | null },
) {
  const formData = new FormData();
  if (input.course) formData.append("course", input.course);
  if (input.title) formData.append("title", input.title);
  if (input.file) formData.append("file", input.file);
  const { data } = await api.put(`/courses/update/materials/${id}/`, formData);
  return data;
}

export async function deleteMaterial(id: number) {
  const { data } = await api.delete(`/courses/update/materials/${id}/`);
  return data;
}

export async function fetchCourseStatistics(courseCode: string) {
  const { data } = await api.get<CourseStatistics>(`/courses/course/statistics/${courseCode}/`);
  return data;
}
