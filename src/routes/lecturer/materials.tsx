import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";
import { MaterialsPanel } from "@/components/courses/MaterialsPanel";

export const Route = createFileRoute("/lecturer/materials")({
  head: () => ({
    meta: [
      { title: "Course materials | Chuo LMS" },
      { name: "description", content: "Upload, update and remove teaching materials for a course." },
      { property: "og:title", content: "Course materials | Chuo LMS" },
      { property: "og:description", content: "Upload and manage teaching materials." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Course materials" description="Publish files for your students">
      <LecturerMaterials />
    </LecturerRoute>
  ),
});

function LecturerMaterials() {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-6">
      <CourseCodePicker value={code} onSelect={setCode} label="Choose a course" />
      {code ? <MaterialsPanel courseCode={code} canManage /> : null}
    </div>
  );
}
