import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEnrolledCourses } from "@/api/courseApi";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { AssessmentsPanel } from "@/components/assessments/AssessmentsPanel";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/common/States";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/student/assessments")({
  head: () => ({
    meta: [
      { title: "Assessments | Chuo LMS" },
      { name: "description", content: "CATs and assignments for the units you are enrolled in." },
      { property: "og:title", content: "Assessments | Chuo LMS" },
      { property: "og:description", content: "CATs and assignments for your enrolled units." },
    ],
  }),
  component: () => (
    <StudentRoute title="Assessments" description="CATs and assignments per unit">
      <StudentAssessments />
    </StudentRoute>
  ),
});

function StudentAssessments() {
  const [selected, setSelected] = useState("");
  const courses = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: fetchEnrolledCourses,
    retry: false,
  });

  const codes = (courses.data ?? []).map((c) => String(c.code)).filter(Boolean);
  const active = selected || codes[0] || "";

  return (
    <div className="space-y-6">
      {courses.isLoading ? <RowsSkeleton count={2} /> : null}
      {courses.isError ? <ErrorState error={courses.error} /> : null}
      {courses.isSuccess && codes.length === 0 ? (
        <EmptyState title="No enrolled units" description="Enroll in a course to see assessments." />
      ) : null}

      {codes.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {codes.map((code) => (
              <Button
                key={code}
                size="sm"
                variant={code === active ? "default" : "outline"}
                onClick={() => setSelected(code)}
              >
                {code}
              </Button>
            ))}
          </div>
          <AssessmentsPanel courseCode={active} canSubmit />
        </>
      ) : null}
    </div>
  );
}
