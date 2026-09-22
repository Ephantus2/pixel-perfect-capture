import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Loader2 } from "lucide-react";
import { fetchGrade, fetchMySubmissions } from "@/api/assessmentApi";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/common/States";
import { submissionCourseCode, type MySubmission } from "@/types/submission";
import { apiErrorMessage } from "@/utils/apiError";

export const Route = createFileRoute("/student/grades")({
  head: () => ({
    meta: [
      { title: "My grades | Chuo LMS" },
      { name: "description", content: "View marks and lecturer feedback for your submissions." },
      { property: "og:title", content: "My grades | Chuo LMS" },
      { property: "og:description", content: "Marks and lecturer feedback for your submissions." },
    ],
  }),
  component: () => (
    <StudentRoute title="Grades" description="Marks and feedback per submission">
      <StudentGrades />
    </StudentRoute>
  ),
});

function GradePanel({ submissionId }: { submissionId: number }) {
  const query = useQuery({
    queryKey: ["grade", submissionId],
    queryFn: () => fetchGrade(submissionId),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Fetching grade…
      </p>
    );
  }

  if (query.isError) {
    const message = apiErrorMessage(query.error);
    const notFound = /not found|404/i.test(message);
    return (
      <p className="text-sm text-muted-foreground">
        {notFound ? "This submission has not been graded yet." : message}
      </p>
    );
  }

  const grade = query.data;
  if (!grade || grade.marks == null) {
    return <p className="text-sm text-muted-foreground">This submission has not been graded yet.</p>;
  }

  const gradedAt = grade.graded_at ?? grade.created_at;
  return (
    <div className="rounded-lg bg-secondary p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Marks</p>
      <p className="font-display text-3xl font-semibold text-primary">{String(grade.marks)}</p>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Feedback</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">
        {grade.feedback || "No feedback provided."}
      </p>
      {gradedAt ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Graded {new Date(String(gradedAt)).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}

function SubmissionGradeRow({ submission }: { submission: MySubmission }) {
  const [open, setOpen] = useState(false);
  const assessment =
    submission.assessment && typeof submission.assessment === "object" ? submission.assessment : null;
  const code = submissionCourseCode(submission);

  return (
    <li className="surface-card space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {code ? (
          <Badge variant="secondary" className="font-mono">
            {code}
          </Badge>
        ) : null}
        <span className="font-medium">{assessment?.title ?? `Submission #${submission.id}`}</span>
        {assessment?.assessment_type ? (
          <Badge variant="outline">{assessment.assessment_type}</Badge>
        ) : null}
        {assessment?.total_marks != null ? (
          <span className="text-xs text-muted-foreground">out of {assessment.total_marks}</span>
        ) : null}
        <Button
          size="sm"
          variant={open ? "outline" : "default"}
          className="ml-auto"
          onClick={() => setOpen((v) => !v)}
        >
          <Award className="mr-2 size-4" /> {open ? "Hide grade" : "View grade"}
        </Button>
      </div>
      {open ? <GradePanel submissionId={submission.id} /> : null}
    </li>
  );
}

function StudentGrades() {
  const query = useQuery({
    queryKey: ["my-submissions"],
    queryFn: fetchMySubmissions,
    retry: false,
  });

  if (query.isLoading) return <RowsSkeleton />;
  if (query.isError) return <ErrorState error={query.error} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="No submissions yet"
        description="Once you submit work, its grade will appear here."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {query.data.map((submission) => (
        <SubmissionGradeRow key={submission.id} submission={submission} />
      ))}
    </ul>
  );
}
