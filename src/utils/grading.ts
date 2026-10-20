import type { GradePayload } from "@/types/grade";

export function gradePayload(assessment: unknown, student: unknown, marks: string, total?: number): GradePayload {
  const assessmentId = Number(assessment);
  const studentId = Number(student);
  if (!Number.isInteger(assessmentId) || assessmentId <= 0) throw new Error("No valid assessment ID was returned.");
  if (!Number.isInteger(studentId) || studentId <= 0) throw new Error("No valid student ID was returned.");
  const value = Number(marks);
  if (!marks.trim() || !Number.isFinite(value) || value < 0) throw new Error("Enter non-negative marks.");
  if (total != null && value > total) throw new Error(`Marks cannot exceed the total of ${total}`);
  return { assessment: assessmentId, student: studentId, marks: value };
}

export interface BulkMarkInput { registration_number: string; marks: string }

export function bulkMarksPayload(rows: BulkMarkInput[], total?: number) {
  if (!rows.length) throw new Error("Add at least one student.");
  const seen = new Set<string>();
  return { marks: rows.map((row) => {
    const registration_number = row.registration_number.trim();
    if (!registration_number) throw new Error("Enter each student's registration number.");
    if (seen.has(registration_number.toUpperCase())) throw new Error(`Duplicate registration number: ${registration_number}`);
    seen.add(registration_number.toUpperCase());
    gradePayload(1, 1, row.marks, total);
    return { registration_number, marks: row.marks.trim() };
  }) };
}