import { describe, expect, test } from "bun:test";
import { selectedAcademicYear, selectedTeachingCourseId } from "./academicSelection";
import { submissionStudentName } from "../types/submission";

describe("Django academic workflow selections", () => {
  test("uses the fetched academic-year name without deriving it from year numbers", () => {
    const years = [{ id: 1, name: "2026/2027", start_year: 2026, end_year: 2017, is_current: true }];
    expect(selectedAcademicYear(years, "2026/2027")).toBe("2026/2027");
    expect(() => selectedAcademicYear(years, "2026/2017")).toThrow();
  });

  test("submits a numeric ID only for a course the lecturer teaches", () => {
    const courses = [{ id: 1, code: "COM 321", name: "Object oriented programming" }];
    expect(selectedTeachingCourseId(courses, "1")).toBe(1);
    expect(() => selectedTeachingCourseId(courses, "COM 321")).toThrow();
    expect(() => selectedTeachingCourseId(courses, "2")).toThrow();
  });

  test("reads the student's name from the nested submission identity", () => {
    expect(submissionStudentName({ id: 1, student: { id: 1, first_name: "Ephantus", last_name: "Mwago", login_id: "P101/4292G/23" } })).toBe("Ephantus Mwago");
  });
});