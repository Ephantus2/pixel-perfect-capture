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
    ],
  }),
  component: () => (
    <AdminRoute title="User management" description="Accounts and roles">
      <ComingSoon
        feature="User management"
        note="The Django backend exposes register, login, logout and details only — there is no user listing or role-assignment endpoint yet."
      />
    </AdminRoute>
  ),
});
