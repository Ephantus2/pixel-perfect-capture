import { createFileRoute } from "@tanstack/react-router";
import { AdminRoute } from "@/components/auth/RoleRoute";
import { ComingSoon } from "@/components/common/States";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User management | Chuo LMS" },
      { name: "description", content: "Administer student, lecturer and admin accounts." },
      { property: "og:title", content: "User management | Chuo LMS" },
      { property: "og:description", content: "Administer accounts across the university." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminRoute title="User management" description="Accounts and roles">
      <ComingSoon
        feature="User management"
        note="Accounts and roles are managed by the university administration. New users can create their own account through registration."
      />
    </AdminRoute>
  ),
});
