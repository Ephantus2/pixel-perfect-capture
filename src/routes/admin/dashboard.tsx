import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, Building2, Users } from "lucide-react";
import { AdminRoute } from "@/components/auth/RoleRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | Chuo LMS" },
      { name: "description", content: "Manage courses, users and academic structure." },
      { property: "og:title", content: "Admin dashboard | Chuo LMS" },
      { property: "og:description", content: "Manage courses, users and academic structure." },
    ],
  }),
  component: () => (
    <AdminRoute title="Administration" description="University-wide management">
      <AdminDashboard />
    </AdminRoute>
  ),
});

const SECTIONS = [
  {
    to: "/admin/courses",
    label: "Course management",
    icon: BookOpen,
    description: "Create, update and delete courses.",
    available: true,
  },
  {
    to: "/admin/users",
    label: "User management",
    icon: Users,
    description: "No backend endpoint yet.",
    available: false,
  },
  {
    to: "/admin/academic",
    label: "Academic structure",
    icon: Building2,
    description: "Programmes and departments — no endpoint yet.",
    available: false,
  },
  {
    to: "/admin/statistics",
    label: "Statistics",
    icon: BarChart3,
    description: "Per-course enrollment figures.",
    available: true,
  },
] as const;

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-hidden">
        <div className="auth-backdrop px-6 py-8 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-80">Welcome</p>
          <h2 className="font-display text-3xl font-semibold">{user?.first_name}</h2>
          <p className="mt-1 text-sm opacity-80">Signed in as {user?.login_id}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.to}>
            <CardHeader>
              <section.icon className="size-5 text-primary" />
              <CardTitle className="text-base">{section.label}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant={section.available ? "default" : "outline"} size="sm">
                <Link to={section.to}>{section.available ? "Open" : "Coming soon"}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
