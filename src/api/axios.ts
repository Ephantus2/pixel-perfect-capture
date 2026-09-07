import axios from "axios";

export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://127.0.0.1:8000";

/**
 * Centralized Axios instance.
 * withCredentials is required: Django stores the JWT access/refresh tokens
 * in HTTP-only cookies, which the browser attaches automatically.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

export default api;
