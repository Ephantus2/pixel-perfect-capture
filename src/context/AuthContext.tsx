import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, loginUser, logoutUser } from "@/api/authApi";
import type { CurrentUser, LoginPayload, Role } from "@/types/auth";

export interface AuthContextValue {
  user: CurrentUser | null;
  role: Role | null;
  initializing: boolean;
  login: (payload: LoginPayload) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<CurrentUser | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function dashboardPathFor(role: Role | null | undefined) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "LECTURER") return "/lecturer/dashboard";
  if (role === "STUDENT") return "/student/dashboard";
  return "/login";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const details = await fetchCurrentUser();
      setUser(details);
      return details;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await refresh();
      if (active) setInitializing(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    await loginUser(payload);
    const details = await fetchCurrentUser();
    setUser(details);
    return details;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, role: user?.role ?? null, initializing, login, logout, refresh }),
    [user, initializing, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
