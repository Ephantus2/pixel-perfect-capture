import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubmission, fetchMySubmissions, updateSubmission } from "@/api/assessmentApi";
import { apiErrorMessage } from "@/utils/apiError";
import { fileName, fileUrl } from "@/utils/fileUrl";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { submissionCourseCode, type MySubmission } from "@/types/submission";

export const Route = createFileRoute("/student/submissions")({
  head: () => ({
    meta: [
      { title: "My submissions | Chuo LMS" },
      { name: "description", content: "Review, update or withdraw work you submitted." },
      { property: "og:title", content: "My submissions | Chuo LMS" },
      { property: "og:description", content: "Review, update or withdraw submitted coursework." },
    ],
  }),
  component: () => (
    <StudentRoute title="My submissions" description="Work you have submitted">
      <StudentSubmissions />
    </StudentRoute>
  ),
});

function EditDialog({ submission }: { submission: MySubmission }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(submission.answer ?? "");
  const [file, setFile] = useState<File | null>(null);

  const update = useMutation({
    mutationFn: () => updateSubmission(submission.id, { answer, file }),
    onSuccess: () => {
      toast.success("Submission updated successfully");
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      setOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setAnswer(submission.answer ?? "");
          setFile(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update submission</DialogTitle>
          <DialogDescription>Leave the file empty to keep the current attachment.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`answer-${submission.id}`}>Answer</Label>
            <Textarea
              id={`answer-${submission.id}`}
              rows={8}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`file-${submission.id}`}>Replace attachment</Label>
            <Input
              id={`file-${submission.id}`}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudentSubmissions() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["my-submissions"],
    queryFn: fetchMySubmissions,
    retry: false,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteSubmission(id),
    onSuccess: () => {
      toast.success("Submission withdrawn");
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (query.isLoading) return <RowsSkeleton />;
  if (query.isError) return <ErrorState error={query.error} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="No submissions yet"
        description="Work you submit from the Assessments page will appear here."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {query.data.map((submission) => {
        const assessment =
          submission.assessment && typeof submission.assessment === "object"
            ? submission.assessment
            : null;
        const href = fileUrl(submission.file);
        const code = submissionCourseCode(submission);
        return (
          <li key={submission.id} className="surface-card space-y-3 p-4">
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
                <span className="text-xs text-muted-foreground">
                  {assessment.total_marks} marks
                </span>
              ) : null}
              <span className="ml-auto text-xs text-muted-foreground">
                {submission.submitted_at
                  ? `Submitted ${new Date(submission.submitted_at).toLocaleString()}`
                  : null}
              </span>
            </div>
            {submission.answer ? (
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                {submission.answer}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">No written answer.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {href ? (
                <Button asChild variant="outline" size="sm">
                  <a href={href} target="_blank" rel="noreferrer" download={fileName(submission.file)}>
                    <Download className="mr-2 size-4" /> Attachment
                  </a>
                </Button>
              ) : null}
              <EditDialog submission={submission} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="mr-2 size-4 text-destructive" /> Withdraw
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw this submission?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your work for “{assessment?.title ?? `Submission #${submission.id}`}” will be
                      deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove.mutate(submission.id)}>
                      Withdraw
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
