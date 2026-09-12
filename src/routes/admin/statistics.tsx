import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminRoute } from "@/components/auth/RoleRoute";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";
import { StatisticsPanel } from "@/components/courses/StatisticsPanel";

export const Route = createFileRoute("/admin/statistics")({
  head: () => ({
    meta: [
      { title: "Statistics | Chuo LMS" },
      { name: "description", content: "Per-course enrollment statistics from the backend." },
      { property: "og:title", content: "Statistics | Chuo LMS" },
      { property: "og:description", content: "Per-course enrollment statistics." },
    ],
  }),
  component: () => (
    <AdminRoute title="Statistics" description="Per-course figures">
      <AdminStatistics />
    </AdminRoute>
  ),
});

function AdminStatistics() {
  const [code, setCode] = useState("");
  return (
    <div className="space-y-6">
      <CourseCodePicker value={code} onSelect={setCode} label="Choose a course" />
      {code ? <StatisticsPanel courseCode={code} /> : null}
    </div>
  );
}
