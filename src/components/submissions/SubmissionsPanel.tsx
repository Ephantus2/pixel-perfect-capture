import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createGrade,
  deleteSubmission,
  fetchAssessmentSubmissions,
  fetchGrade,
  updateGrade,
} from "@/api/assessmentApi";
import { apiErrorMessage, parseApiError } from "@/utils/apiError";
import { fileName, fileUrl } from "@/utils/fileUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/common/States";
import type { Submission } from "@/types/submission";

function GradeDialog({
  submission,
  totalMarks,
}: {
  submission: Submission;
  totalMarks?: number | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const queryClient = useQueryClient();

  const existing = useQuery({
    queryKey: ["grade", submission.id],
    queryFn: () => fetchGrade(submission.id),
    enabled: open,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const value = Number(marks);
      if (Number.isNaN(value) || value < 0) throw new Error("Marks cannot be negative");
      if (totalMarks != null && value > totalMarks)
        throw new Error(`Marks cannot exceed the total of ${totalMarks}`);
      const gradeId = existing.data?.id;
      const payload = { submission: submission.id, marks: value, feedback };
      return gradeId ? updateGrade(gradeId, payload) : createGrade(payload);
    },
    onSuccess: () => {
      toast.success("Grade saved successfully");
      queryClient.invalidateQueries({ queryKey: ["grade", submission.id] });
      setOpen(false);
    },
    onError: (error) =>
      toast.error(
        error instanceof Error && !("response" in error) ? error.message : apiErrorMessage(error),
      ),
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setMarks(existing.data ? String(existing.data.marks) : "");
      setFeedback(existing.data?.feedback ?? "");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Grade</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grade submission #{submission.id}</DialogTitle>
          <DialogDescription>
            {totalMarks != null
              ? `Marks must be between 0 and ${totalMarks}.`
              : "Marks cannot be negative."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="g-marks">Marks</Label>
            <Input
              id="g-marks"
              type="number"
              min={0}
              max={totalMarks}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder={existing.isLoading ? "Loading existing grade…" : "0"}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-feedback">Feedback</Label>
            <Textarea
              id="g-feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving grade…
                </>
              ) : (
                "Save grade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SubmissionsPanel({
  assessmentId,
  totalMarks,
  canGrade = false,
  canDelete = false,
}: {
  assessmentId: number;
  totalMarks?: number | undefined;
  canGrade?: boolean;
  canDelete?: boolean;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["submissions", assessmentId],
    queryFn: () => fetchAssessmentSubmissions(assessmentId),
    enabled: Number.isFinite(assessmentId) && assessmentId > 0,
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteSubmission(id),
    onSuccess: () => {
      toast.success("Submission deleted");
      queryClient.invalidateQueries({ queryKey: ["submissions", assessmentId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (query.isLoading) return <RowsSkeleton />;
  if (query.isError) {
    const parsed = parseApiError(query.error);
    if (parsed.status === 404) {
      return (
        <EmptyState
          title="No submissions found"
          description="The backend returned 404 for this assessment ID."
        />
      );
    }
    return <ErrorState error={query.error} />;
  }
  if (!query.data?.length) {
    return <EmptyState title="No submissions yet" description="Students have not submitted work." />;
  }

  return (
    <ul className="space-y-3">
      {query.data.map((submission) => (
        <li key={submission.id} className="surface-card space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">
              {submission.student_name ?? `Student ${submission.student ?? "—"}`}
            </span>
            <span className="text-xs text-muted-foreground">Submission #{submission.id}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {submission.submitted_at
                ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}`
                : null}
              {submission.updated_at
                ? ` · Updated ${new Date(submission.updated_at).toLocaleString()}`
                : null}
            </span>
          </div>
          {submission.answer ? (
            <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{submission.answer}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No written answer.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {fileUrl(submission.file) ? (
              <Button asChild variant="outline" size="sm">
                <a
                  href={fileUrl(submission.file)!}
                  target="_blank"
                  rel="noreferrer"
                  download={fileName(submission.file)}
                >
                  <Download className="mr-2 size-4" /> Attachment
                </a>
              </Button>
            ) : null}
            {canGrade ? <GradeDialog submission={submission} totalMarks={totalMarks} /> : null}
            {canDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="mr-2 size-4 text-destructive" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete submission #{submission.id}?</AlertDialogTitle>
                    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeMutation.mutate(submission.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
