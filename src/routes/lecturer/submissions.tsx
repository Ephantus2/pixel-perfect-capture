import { createFileRoute } from "@tanstack/react-router";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { SubmissionsWorkspace } from "@/components/submissions/SubmissionsWorkspace";

export const Route = createFileRoute("/lecturer/submissions")({
  head: () => ({
    meta: [
      { title: "Student submissions | Chuo LMS" },
      { name: "description", content: "Review work submitted by students for each assessment." },
      { property: "og:title", content: "Student submissions | Chuo LMS" },
      { property: "og:description", content: "Review submitted student work per assessment." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Student submissions" description="Review submitted work">
      <SubmissionsWorkspace canGrade={false} />
    </LecturerRoute>
  ),
});
