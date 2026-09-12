import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";
import { AssessmentsPanel } from "@/components/assessments/AssessmentsPanel";

export const Route = createFileRoute("/lecturer/assessments")({
  head: () => ({
    meta: [
      { title: "Manage assessments | Chuo LMS" },
      { name: "description", content: "Create, edit and delete CATs and assignments for a course." },
      { property: "og:title", content: "Manage assessments | Chuo LMS" },
      { property: "og:description", content: "Create, edit and delete CATs and assignments." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Assessments" description="Set CATs and assignments">
      <LecturerAssessments />
    </LecturerRoute>
  ),
});

function LecturerAssessments() {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-6">
      <CourseCodePicker value={code} onSelect={setCode} label="Choose a course" />
      {code ? <AssessmentsPanel courseCode={code} canManage /> : null}
    </div>
  );
}
