import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/lecturer/courses")({
  head: () => ({
    meta: [
      { title: "My courses | Chuo LMS" },
      { name: "description", content: "Open a course you teach by its course code." },
      { property: "og:title", content: "My courses | Chuo LMS" },
      { property: "og:description", content: "Open a course you teach by its course code." },
    ],
  }),
  component: () => (
    <LecturerRoute title="My courses" description="Open a course by code">
      <LecturerCourses />
    </LecturerRoute>
  ),
});

function LecturerCourses() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Course list — coming soon</AlertTitle>
        <AlertDescription>
          The backend does not yet expose an endpoint listing the courses assigned to a lecturer.
          Open a course by entering its code; recent codes are kept on this device.
        </AlertDescription>
      </Alert>
      <CourseCodePicker
        value=""
        onSelect={(code) => navigate({ to: "/courses/$courseCode", params: { courseCode: code } })}
      />
    </div>
  );
}
