import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { fetchGrade } from "@/api/assessmentApi";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, RowsSkeleton } from "@/components/common/States";

export const Route = createFileRoute("/student/grades")({
  head: () => ({
    meta: [
      { title: "My grades | Chuo LMS" },
      { name: "description", content: "View marks and lecturer feedback for a submission." },
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

function StudentGrades() {
  const [input, setInput] = useState("");
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["grade", submissionId],
    queryFn: () => fetchGrade(submissionId as number),
    enabled: submissionId != null,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Look up a grade</CardTitle>
          <CardDescription>
            Grades are published per submission. Enter the submission ID you received when you
            submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(input);
              if (Number.isFinite(value) && value > 0) setSubmissionId(value);
            }}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="grade-id" className="sr-only">
                Submission ID
              </Label>
              <Input
                id="grade-id"
                type="number"
                placeholder="Submission ID"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button type="submit">
              <Search className="mr-2 size-4" /> View grade
            </Button>
          </form>
        </CardContent>
      </Card>

      {query.isFetching ? <RowsSkeleton count={1} /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {query.isSuccess && query.data ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Submission #{String(query.data.submission ?? submissionId)}
            </CardTitle>
            <CardDescription>
              {query.data.graded_at ?? query.data.created_at
                ? `Graded ${new Date(String(query.data.graded_at ?? query.data.created_at)).toLocaleString()}`
                : "Graded"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Marks</p>
              <p className="font-display text-4xl font-semibold text-primary">{query.data.marks}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Feedback</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {query.data.feedback || "No feedback provided."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
