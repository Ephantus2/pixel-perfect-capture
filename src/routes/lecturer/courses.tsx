import { createFileRoute } from "@tanstack/react-router";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { CourseCard } from "@/components/courses/CourseCard";
import { useTeachingCourses } from "@/components/courses/TeachingCourseSelect";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/common/States";

export const Route = createFileRoute("/lecturer/courses")({
  head: () => ({
    meta: [
      { title: "My courses | Chuo LMS" },
      { name: "description", content: "Courses you are assigned to teach." },
      { property: "og:title", content: "My courses | Chuo LMS" },
      { property: "og:description", content: "Courses you are assigned to teach." },
    ],
  }),
  component: () => (
    <LecturerRoute title="My courses" description="Courses you teach">
      <LecturerCourses />
    </LecturerRoute>
  ),
});

function LecturerCourses() {
  const query = useTeachingCourses();

  if (query.isLoading) return <RowsSkeleton />;
  if (query.isError) return <ErrorState error={query.error} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="No courses assigned"
        description="You are not assigned to any course yet."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {query.data.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
