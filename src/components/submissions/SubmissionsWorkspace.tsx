import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseAssessments } from "@/api/assessmentApi";
import { TeachingCourseSelect } from "@/components/courses/TeachingCourseSelect";
import { SubmissionsPanel } from "@/components/submissions/SubmissionsPanel";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SubmissionsWorkspace({ canGrade }: { canGrade: boolean }) {
  const [code, setCode] = useState("");
  const [assessmentId, setAssessmentId] = useState<number | null>(null);

  const assessments = useQuery({
    queryKey: ["assessments", code],
    queryFn: () => fetchCourseAssessments(code),
    enabled: Boolean(code),
    retry: false,
  });

  const active = assessments.data?.find((a) => a.id === assessmentId);

  return (
    <div className="space-y-6">
      <TeachingCourseSelect
        value={code}
        onSelect={(next) => {
          setCode(next);
          setAssessmentId(null);
        }}
        autoSelectFirst
      />

      {code ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select an assessment</CardTitle>
            <CardDescription>Submissions are listed per assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.isLoading ? <RowsSkeleton count={2} /> : null}
            {assessments.isError ? <ErrorState error={assessments.error} /> : null}
            {assessments.isSuccess && assessments.data.length === 0 ? (
              <EmptyState title="No assessments for this course" />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(assessments.data ?? []).map((a) => (
                <Button
                  key={a.id}
                  size="sm"
                  variant={a.id === assessmentId ? "default" : "outline"}
                  onClick={() => setAssessmentId(a.id)}
                >
                  {a.title} · {a.total_marks} marks
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {assessmentId ? (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">
            Submissions — {active?.title ?? `Assessment #${assessmentId}`}
          </h2>
          <SubmissionsPanel
            assessmentId={assessmentId}
            totalMarks={active?.total_marks}
            canGrade={canGrade}
          />
        </section>
      ) : null}
    </div>
  );
}
