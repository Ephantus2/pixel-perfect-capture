import { createFileRoute } from "@tanstack/react-router";
import { AdminRoute } from "@/components/auth/RoleRoute";
import { ComingSoon } from "@/components/common/States";

export const Route = createFileRoute("/admin/academic")({
  head: () => ({
    meta: [
      { title: "Academic structure | Chuo LMS" },
      { name: "description", content: "Faculties, departments and programmes." },
      { property: "og:title", content: "Academic structure | Chuo LMS" },
      { property: "og:description", content: "Faculties, departments and programmes." },
    ],
  }),
  component: () => (
    <AdminRoute title="Academic structure" description="Faculties, departments, programmes">
      <ComingSoon
        feature="Academic structure"
        note="No endpoints exist yet for programmes or departments. Course creation currently takes numeric programme and lecturer IDs."
      />
    </AdminRoute>
  ),
});
