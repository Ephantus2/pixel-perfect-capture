import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";
import { StatisticsPanel } from "@/components/courses/StatisticsPanel";

export const Route = createFileRoute("/lecturer/statistics")({
  head: () => ({
    meta: [
      { title: "Enrollment statistics | Chuo LMS" },
      { name: "description", content: "Enrollment figures reported by the backend for a course." },
      { property: "og:title", content: "Enrollment statistics | Chuo LMS" },
      { property: "og:description", content: "Enrollment figures for a course." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Statistics" description="Enrollment figures per course">
      <LecturerStatistics />
    </LecturerRoute>
  ),
});

function LecturerStatistics() {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-6">
      <CourseCodePicker value={code} onSelect={setCode} label="Choose a course" />
      {code ? <StatisticsPanel courseCode={code} /> : null}
    </div>
  );
}
