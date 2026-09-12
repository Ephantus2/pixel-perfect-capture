import { createFileRoute } from "@tanstack/react-router";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { SubmissionsWorkspace } from "@/components/submissions/SubmissionsWorkspace";

export const Route = createFileRoute("/lecturer/grading")({
  head: () => ({
    meta: [
      { title: "Grading | Chuo LMS" },
      { name: "description", content: "Award marks and write feedback for student submissions." },
      { property: "og:title", content: "Grading | Chuo LMS" },
      { property: "og:description", content: "Award marks and feedback for submissions." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Grading" description="Award marks and feedback">
      <SubmissionsWorkspace canGrade />
    </LecturerRoute>
  ),
});
