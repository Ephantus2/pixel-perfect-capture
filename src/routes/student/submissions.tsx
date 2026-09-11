import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubmission, updateSubmission } from "@/api/assessmentApi";
import { apiErrorMessage } from "@/utils/apiError";
import { StudentRoute } from "@/components/auth/RoleRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/student/submissions")({
  head: () => ({
    meta: [
      { title: "My submissions | Chuo LMS" },
      { name: "description", content: "Update or withdraw work you submitted for an assessment." },
      { property: "og:title", content: "My submissions | Chuo LMS" },
      { property: "og:description", content: "Update or withdraw submitted coursework." },
    ],
  }),
  component: () => (
    <StudentRoute title="My submissions" description="Update or withdraw submitted work">
      <StudentSubmissions />
    </StudentRoute>
  ),
});

function StudentSubmissions() {
  const [id, setId] = useState("");
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const update = useMutation({
    mutationFn: () => updateSubmission(Number(id), { answer, file }),
    onSuccess: () => toast.success("Submission updated successfully"),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () => deleteSubmission(Number(id)),
    onSuccess: () => {
      toast.success("Submission deleted");
      setId("");
      setAnswer("");
      setFile(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const disabled = !id || Number.isNaN(Number(id));

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Submissions are managed by ID</AlertTitle>
        <AlertDescription>
          The backend has no “list my submissions” endpoint yet. Submit work from the Assessments
          page — the submission ID is shown in the confirmation — then edit or withdraw it here.
        </AlertDescription>
      </Alert>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Update a submission</CardTitle>
          <CardDescription>Send a revised answer or replace the attached file.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="sub-id">Submission ID</Label>
              <Input
                id="sub-id"
                type="number"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-answer">Answer</Label>
              <Textarea
                id="sub-answer"
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-file">Replace attachment</Label>
              <Input
                id="sub-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={disabled || update.isPending}>
                {update.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Update submission"
                )}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" disabled={disabled}>
                    <Trash2 className="mr-2 size-4" /> Withdraw
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw submission #{id}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your work will be deleted from the assessment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove.mutate()}>Withdraw</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
