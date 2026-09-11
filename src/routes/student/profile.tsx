import { createFileRoute } from "@tanstack/react-router";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { ProfileCard } from "@/components/common/ProfileCard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Student profile | Chuo LMS" },
      { name: "description", content: "Your registration details as held by the university." },
      { property: "og:title", content: "Student profile | Chuo LMS" },
      { property: "og:description", content: "Your registration details on record." },
    ],
  }),
  component: () => (
    <StudentRoute title="Profile" description="Your details on record">
      <Profile />
    </StudentRoute>
  ),
});

function Profile() {
  const { user } = useAuth();
  return user ? <ProfileCard user={user} /> : null;
}
