import api from "./axios";
import type { CurrentUser, LoginPayload, LoginResponse, RegisterPayload } from "@/types/auth";
import type { ProfilePayload } from "@/types/academics";

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

export async function createProfile(payload: ProfilePayload) {
  const { data } = await api.post("/users/create/profile/", payload);
  return data;
}
