import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, ClipboardList, FileStack, Send } from "lucide-react";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/lecturer/dashboard")({
  head: () => ({
    meta: [
      { title: "Lecturer dashboard | Chuo LMS" },
      {
        name: "description",
        content: "Publish materials, set CATs and assignments, and grade student submissions.",
      },
      { property: "og:title", content: "Lecturer dashboard | Chuo LMS" },
      { property: "og:description", content: "Materials, assessments, submissions and grading." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Lecturer dashboard" description="Teaching overview">
      <LecturerDashboard />
    </LecturerRoute>
  ),
});

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

function LecturerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-hidden">
        <div className="auth-backdrop px-6 py-8 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-80">Welcome</p>
          <h2 className="font-display text-3xl font-semibold">{user?.first_name}</h2>
          <p className="mt-1 text-sm opacity-80">{user?.department ?? "Department not set"}</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Stat label="Staff / Login ID" value={user?.login_id ?? "—"} />
          <Stat label="Department" value={user?.department ?? "—"} />
        </div>
      </section>

      <CourseCodePicker
        value=""
        onSelect={(code) => navigate({ to: "/courses/$courseCode", params: { courseCode: code } })}
        label="Open one of your courses"
        description="Enter a course code to manage its materials, assessments and statistics."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/lecturer/materials", label: "Course materials", icon: FileStack },
          { to: "/lecturer/assessments", label: "Assessments", icon: ClipboardList },
          { to: "/lecturer/submissions", label: "Student submissions", icon: Send },
          { to: "/lecturer/statistics", label: "Enrollment statistics", icon: BarChart3 },
        ].map((item) => (
          <Card key={item.to}>
            <CardHeader>
              <item.icon className="size-5 text-primary" />
              <CardTitle className="text-base">{item.label}</CardTitle>
              <CardDescription>Work course by course.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={item.to}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
