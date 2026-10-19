import type { AcademicYear } from "@/types/academics";
import type { Course } from "@/types/course";

export function selectedAcademicYear(years: AcademicYear[], name: string): string {
  const year = years.find((item) => item.name === name);
  if (!year) throw new Error("Choose an available academic year.");
  return year.name;
}

export function selectedTeachingCourseId(courses: Course[], value: string): number {
  const course = courses.find((item) => String(item.id) === value);
  if (!course || !Number.isFinite(course.id) || course.id <= 0) {
    throw new Error("Choose a course you teach.");
  }
  return course.id;
}