import api from "./axios";
import type { CurrentUser, LoginPayload, LoginResponse, RegisterPayload } from "@/types/auth";

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post<{ message: string }>("/users/register/", payload);
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>("/users/login/", payload);
  return data;
}

export async function logoutUser() {
  const { data } = await api.post<{ message: string }>("/users/logout/", {});
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get<CurrentUser>("/users/details/");
  return data;
}
