import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { dashboardPathFor } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chuo LMS | University Learning Management System" },
      {
        name: "description",
        content:
          "Chuo LMS connects students, lecturers and administrators: enrolment, course materials, assessments, submissions and grading.",
      },
      { property: "og:title", content: "Chuo LMS | University Learning Management System" },
      {
        property: "og:description",
        content: "Enrolment, course materials, assessments, submissions and grading in one portal.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing) return;
    navigate({ to: user ? dashboardPathFor(user.role) : "/login", replace: true });
  }, [initializing, user, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <GraduationCap className="size-8 animate-pulse text-primary" />
      <p className="text-sm text-muted-foreground">Loading Chuo LMS…</p>
    </div>
  );
}
