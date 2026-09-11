import { createFileRoute } from "@tanstack/react-router";
import { AdminRoute } from "@/components/auth/RoleRoute";
import { ProfileCard } from "@/components/common/ProfileCard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Admin profile | Chuo LMS" },
      { name: "description", content: "Administrator account details." },
      { property: "og:title", content: "Admin profile | Chuo LMS" },
      { property: "og:description", content: "Administrator account details." },
    ],
  }),
  component: () => (
    <AdminRoute title="Profile" description="Administrator account">
      <Profile />
    </AdminRoute>
  ),
});

function Profile() {
  const { user } = useAuth();
  return user ? <ProfileCard user={user} /> : null;
}
