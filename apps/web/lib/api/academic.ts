import { apiClient } from "./client";
import type { University, Department, Semester } from "../types";

export async function getUniversities(): Promise<University[]> {
  const { data } = await apiClient.get<University[]>("/api/universities");
  return data;
}

export async function getDepartments(universityId: string): Promise<Department[]> {
  const { data } = await apiClient.get<Department[]>(
    `/api/universities/${universityId}/departments`
  );
  return data;
}

export async function getSemesters(departmentId: string): Promise<Semester[]> {
  const { data } = await apiClient.get<Semester[]>(
    `/api/departments/${departmentId}/semesters`
  );
  return data;
}
