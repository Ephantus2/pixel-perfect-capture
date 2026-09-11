import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarClock, ScrollText } from "lucide-react";
import { fetchEnrolledCourses } from "@/api/courseApi";
import { fetchCourseAssessments } from "@/api/assessmentApi";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { CourseCard } from "@/components/courses/CourseCard";
import { EnrollDialog } from "@/components/courses/EnrollDialog";
import { UnenrollButton } from "@/components/courses/UnenrollButton";
import { DueBadge } from "@/components/assessments/AssessmentsPanel";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [
      { title: "Student dashboard | Chuo LMS" },
      {
        name: "description",
        content: "Your enrolled units, upcoming CATs and assignments, and quick actions.",
      },
      { property: "og:title", content: "Student dashboard | Chuo LMS" },
      { property: "og:description", content: "Enrolled units, upcoming assessments and grades." },
    ],
  }),
  component: () => (
    <StudentRoute title="Student dashboard" description="Your academic overview">
      <StudentDashboard />
    </StudentRoute>
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

function StudentDashboard() {
  const { user } = useAuth();
  const courses = useQuery({ queryKey: ["enrolled-courses"], queryFn: fetchEnrolledCourses, retry: false });

  const codes = (courses.data ?? []).map((c) => String(c.code)).filter(Boolean);
  const assessmentQueries = useQueries({
    queries: codes.map((code) => ({
      queryKey: ["assessments", code],
      queryFn: () => fetchCourseAssessments(code),
      retry: false,
    })),
  });

  const upcoming = assessmentQueries
    .flatMap((q, i) => (q.data ?? []).map((a) => ({ ...a, courseCode: codes[i]! })))
    .filter((a) => a.due_date && new Date(a.due_date).getTime() > Date.now())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-hidden">
        <div className="auth-backdrop px-6 py-8 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-80">Welcome back</p>
          <h2 className="font-display text-3xl font-semibold">{user?.first_name}</h2>
          <p className="mt-1 text-sm opacity-80">{user?.programme ?? "Programme not set"}</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Login ID" value={user?.login_id ?? "—"} />
          <Stat label="Year of study" value={user?.current_year ?? "—"} />
          <Stat label="Admission year" value={user?.admission_year ?? "—"} />
          <Stat label="Enrolled units" value={courses.data?.length ?? "—"} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">My courses</h2>
          <div className="flex gap-2">
            <EnrollDialog />
            <Button asChild variant="outline" size="sm">
              <Link to="/student/courses">View all</Link>
            </Button>
          </div>
        </div>
        {courses.isLoading ? <CardListSkeleton /> : null}
        {courses.isError ? <ErrorState error={courses.error} /> : null}
        {courses.isSuccess && courses.data.length === 0 ? (
          <EmptyState
            title="You are not enrolled in any unit"
            description="Use a course code from your department to enroll."
            action={<EnrollDialog variant="outline" />}
          />
        ) : null}
        {courses.isSuccess && courses.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.data.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id ?? String(course.code)}
                course={course}
                action={<UnenrollButton courseCode={String(course.code)} />}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" /> Upcoming assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing upcoming from your enrolled units.
              </p>
            ) : (
              upcoming.map((a) => (
                <div
                  key={`${a.courseCode}-${a.id}`}
                  className="flex flex-wrap items-center gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.courseCode} · due {new Date(a.due_date).toLocaleString()}
                    </p>
                  </div>
                  <DueBadge due={a.due_date} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <EnrollDialog variant="outline" />
            <Button asChild variant="outline" size="sm">
              <Link to="/student/assessments">
                <BookOpen className="mr-2 size-4" /> View assessments
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/student/grades">
                <ScrollText className="mr-2 size-4" /> Check a grade
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
