import { expect, test } from "bun:test";
import { bulkMarksPayload, gradePayload } from "./grading";
import { performanceTranscript } from "./transcript";
import { createAssessment, createGrade, updateGrade, uploadBulkMarks } from "../api/assessmentApi";
import api from "../api/axios";

test("grades use assessment and student IDs rather than submission IDs", () => {
  expect(gradePayload(2, 1, "30", 30)).toEqual({ assessment: 2, student: 1, marks: 30 });
  expect(() => gradePayload(2, null, "30", 30)).toThrow();
  expect(() => gradePayload(2, 1, "31", 30)).toThrow();
});

test("physical marks retain registration numbers and decimal marks", () => {
  expect(bulkMarksPayload([{ registration_number: "P101/4290G/23", marks: "25.00" }, { registration_number: "P101/4292G/23", marks: "22.50" }], 30)).toEqual({ marks: [{ registration_number: "P101/4290G/23", marks: "25.00" }, { registration_number: "P101/4292G/23", marks: "22.50" }] });
  expect(() => bulkMarksPayload([{ registration_number: "P101/4290G/23", marks: "31" }], 30)).toThrow();
});

test("JSON performance produces a real PDF with supplied results", async () => {
  const blob = await performanceTranscript([{ id: 1, course_code: "COM 310", course_name: "Component Based Software Engineering", academic_year: "2026/2027", total_marks: "30.00", grade: "F" }], "2026/2027");
  const text = await blob.text();
  expect(text.slice(0, 5)).toBe("%PDF-");
  expect(text).toContain("2026/2027");
  expect(text).toContain("COM 310");
});

test("updated Django assessment, grade, and bulk endpoints preserve payloads", async () => {
  const original = api.defaults.adapter;
  const requests = [];
  api.defaults.adapter = async (config) => {
    requests.push({ url: config.url, data: JSON.parse(config.data) });
    return { data: config.url.includes("update/grade") ? { message: "Grade updated successfully.", grade: { id: 8, assessment: 2, student: 1, marks: "28.00" } } : {}, status: 200, statusText: "OK", headers: {}, config };
  };
  try {
    await createAssessment({ course: 1, title: "CAT 1 MAKEUP", description: "create a simple calculator using c", assessment_type: "CAT", assessment_mode: "PHYSICAL", total_marks: 30, due_date: "2026-10-26T00:00:00+03:00" });
    await createGrade(gradePayload(2, 1, "30"));
    const grade = await updateGrade(8, gradePayload(2, 1, "28"));
    await uploadBulkMarks(3, bulkMarksPayload([{ registration_number: "P101/4290G/23", marks: "25.00" }]));
    expect(requests[0].data.assessment_mode).toBe("PHYSICAL");
    expect(requests[1]).toEqual({ url: "/assessment/create/grade/", data: { assessment: 2, student: 1, marks: 30 } });
    expect(grade.id).toBe(8);
    expect(grade.marks).toBe("28.00");
    expect(requests[3]).toEqual({ url: "/assessment/assessments/3/marks/bulk/", data: { marks: [{ registration_number: "P101/4290G/23", marks: "25.00" }] } });
  } finally { api.defaults.adapter = original; }
});