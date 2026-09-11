import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchEnrolledCourses } from "@/api/courseApi";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { CourseCard } from "@/components/courses/CourseCard";
import { EnrollDialog } from "@/components/courses/EnrollDialog";
import { UnenrollButton } from "@/components/courses/UnenrollButton";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/States";

export const Route = createFileRoute("/student/courses")({
  head: () => ({
    meta: [
      { title: "My courses | Chuo LMS" },
      { name: "description", content: "Units you are enrolled in this semester." },
      { property: "og:title", content: "My courses | Chuo LMS" },
      { property: "og:description", content: "Units you are enrolled in this semester." },
    ],
  }),
  component: () => (
    <StudentRoute title="My courses" description="Units you are enrolled in">
      <StudentCourses />
    </StudentRoute>
  ),
});

function StudentCourses() {
  const courses = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: fetchEnrolledCourses,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <EnrollDialog />
      </div>
      {courses.isLoading ? <CardListSkeleton count={6} /> : null}
      {courses.isError ? <ErrorState error={courses.error} /> : null}
      {courses.isSuccess && courses.data.length === 0 ? (
        <EmptyState
          title="No enrolled units"
          description="Enroll using a course code to see materials and assessments."
          action={<EnrollDialog variant="outline" />}
        />
      ) : null}
      {courses.isSuccess && courses.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.data.map((course) => (
            <CourseCard
              key={course.id ?? String(course.code)}
              course={course}
              action={<UnenrollButton courseCode={String(course.code)} />}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
