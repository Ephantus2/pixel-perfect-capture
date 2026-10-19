import api from "./axios";
import { toArray } from "./courseApi";
import type { CoursePerformance } from "@/types/academics";

export type PerformanceResult =
  | { kind: "pdf"; blob: Blob; filename: string }
  | { kind: "rows"; rows: CoursePerformance[] };

/** The existing Django URL can return JSON rows or a PDF FileResponse. */
export async function fetchCoursePerformance(academicYear: string): Promise<PerformanceResult> {
  const response = await api.get<Blob>("/assessment/course/performance/", {
    params: { academic_year: academicYear },
    responseType: "blob",
    headers: { Accept: "application/json, application/pdf" },
  });
  const blob = response.data;
  const signature = await blob.slice(0, 5).text();
  if (signature === "%PDF-") {
    return {
      kind: "pdf",
      blob: new Blob([blob], { type: "application/pdf" }),
      filename: "academic_transcript.pdf",
    };
  }
  let data: unknown;
  try {
    data = JSON.parse(await blob.text());
  } catch {
    throw new Error("The transcript response was neither a PDF nor performance results.");
  }
  if (!Array.isArray(data) && !(data && typeof data === "object" && "results" in data)) {
    throw new Error("No performance results were returned. Please try again.");
  }
  return { kind: "rows", rows: toArray<CoursePerformance>(data) };
}