import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { TeachingCourseSelect } from "@/components/courses/TeachingCourseSelect";
import { StatisticsPanel } from "@/components/courses/StatisticsPanel";

export const Route = createFileRoute("/lecturer/statistics")({
  head: () => ({
    meta: [
      { title: "Enrollment statistics | Chuo LMS" },
      { name: "description", content: "Enrollment figures reported by the backend for a course." },
      { property: "og:title", content: "Enrollment statistics | Chuo LMS" },
      { property: "og:description", content: "Enrollment figures for a course." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
      <TeachingCourseSelect value={code} onSelect={setCode} autoSelectFirst />
      {code ? <StatisticsPanel courseCode={code} /> : null}
    </div>
  );
}
