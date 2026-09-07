import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { dashboardPathFor } from "@/context/AuthContext";
import type { Role } from "@/types/auth";
import { AppShell } from "@/components/layout/AppShell";

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <GraduationCap className="size-8 animate-pulse text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/** Requires an authenticated session; optionally restricts to one role. */
export function ProtectedRoute({
  role,
  title,
  description,
  children,
}: {
  role?: Role;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (role && user.role !== role) {
      navigate({ to: dashboardPathFor(user.role), replace: true });
    }
  }, [initializing, user, role, navigate]);

  if (initializing) return <FullScreenLoader label="Checking your session…" />;
  if (!user) return <FullScreenLoader label="Redirecting to login…" />;
  if (role && user.role !== role) return <FullScreenLoader label="Redirecting…" />;

  return (
    <AppShell title={title} description={description}>
      {children}
    </AppShell>
  );
}

export function StudentRoute(props: Omit<Parameters<typeof ProtectedRoute>[0], "role">) {
  return <ProtectedRoute role="STUDENT" {...props} />;
}
export function LecturerRoute(props: Omit<Parameters<typeof ProtectedRoute>[0], "role">) {
  return <ProtectedRoute role="LECTURER" {...props} />;
}
export function AdminRoute(props: Omit<Parameters<typeof ProtectedRoute>[0], "role">) {
  return <ProtectedRoute role="ADMIN" {...props} />;
}
