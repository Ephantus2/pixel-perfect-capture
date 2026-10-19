import api from "./axios";
import { toArray } from "./courseApi";
import type { AcademicYear, Department, Programme } from "@/types/academics";

export async function fetchProgrammes() {
  const { data } = await api.get("/academics/programme/");
  return toArray<Programme>(data);
}

export async function fetchDepartments() {
  const { data } = await api.get("/academics/department/");
  return toArray<Department>(data);
}

export async function fetchAcademicYears() {
  const { data } = await api.get("/academics/academicyear/");
  return toArray<AcademicYear>(data);
}
