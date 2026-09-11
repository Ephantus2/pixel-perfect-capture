import { createFileRoute } from "@tanstack/react-router";
import { LecturerRoute } from "@/components/auth/RoleRoute";
import { ProfileCard } from "@/components/common/ProfileCard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/lecturer/profile")({
  head: () => ({
    meta: [
      { title: "Lecturer profile | Chuo LMS" },
      { name: "description", content: "Your staff details as held by the university." },
      { property: "og:title", content: "Lecturer profile | Chuo LMS" },
      { property: "og:description", content: "Your staff details on record." },
    ],
  }),
  component: () => (
    <LecturerRoute title="Profile" description="Your staff details">
      <Profile />
    </LecturerRoute>
  ),
});

function Profile() {
  const { user } = useAuth();
  return user ? <ProfileCard user={user} /> : null;
}
