import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createAssessment,
  createSubmission,
  deleteAssessment,
  fetchCourseAssessments,
  updateAssessment,
} from "@/api/assessmentApi";
import { apiErrorMessage } from "@/utils/apiError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Assessment, AssessmentType } from "@/types/assessment";

export function dueStatus(due?: string | null) {
  if (!due) return { label: "No due date", tone: "muted" as const };
  const diff = new Date(due).getTime() - Date.now();
  if (Number.isNaN(diff)) return { label: "No due date", tone: "muted" as const };
  if (diff < 0) return { label: "Past due", tone: "destructive" as const };
  if (diff < 1000 * 60 * 60 * 72) return { label: "Due soon", tone: "warning" as const };
  return { label: "Upcoming", tone: "success" as const };
}

export function DueBadge({ due }: { due?: string | null }) {
  const status = dueStatus(due);
  const className =
    status.tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : status.tone === "warning"
        ? "bg-warning/20 text-warning-foreground"
        : status.tone === "success"
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{status.label}</span>;
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AssessmentForm({
  courseCode,
  assessment,
  onDone,
}: {
  courseCode: string;
  assessment?: Assessment;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [course, setCourse] = useState(assessment?.course != null ? String(assessment.course) : "");
  const [title, setTitle] = useState(assessment?.title ?? "");
  const [description, setDescription] = useState(assessment?.description ?? "");
  const [type, setType] = useState<AssessmentType>(assessment?.assessment_type ?? "CAT");
  const [totalMarks, setTotalMarks] = useState(String(assessment?.total_marks ?? 30));
  const [dueDate, setDueDate] = useState(toLocalInput(assessment?.due_date));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        course: Number(course),
        title,
        description: description ?? "",
        assessment_type: type,
        total_marks: Number(totalMarks),
        due_date: new Date(dueDate).toISOString(),
      };
      return assessment ? updateAssessment(assessment.id, payload) : createAssessment(payload);
    },
    onSuccess: () => {
      toast.success(
        assessment ? "Assessment updated successfully" : "Assessment created successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["assessments", courseCode] });
      onDone();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="a-course">Course ID</Label>
          <Input
            id="a-course"
            type="number"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as AssessmentType)}>
            <SelectTrigger id="a-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAT">CAT</SelectItem>
              <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="a-title">Title</Label>
          <Input id="a-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="a-desc">Description</Label>
          <Textarea
            id="a-desc"
            rows={3}
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-marks">Total marks</Label>
          <Input
            id="a-marks"
            type="number"
            min={1}
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-due">Due date</Label>
          <Input
            id="a-due"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {assessment ? "Saving…" : "Creating assessment…"}
            </>
          ) : assessment ? (
            "Save changes"
          ) : (
            "Create assessment"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function SubmitDialog({ assessment }: { assessment: Assessment }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!answer.trim() && !file) throw new Error("Add a written answer or attach a file");
      return createSubmission({ assessment: assessment.id, answer, file });
    },
    onSuccess: (data: unknown) => {
      const id = (data as { id?: number } | null)?.id;
      toast.success(id ? `Submission successful (submission #${id})` : "Submission successful");
      setOpen(false);
      setAnswer("");
      setFile(null);
    },
    onError: (error) =>
      toast.error(
        error instanceof Error && !("response" in error) ? error.message : apiErrorMessage(error),
      ),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Send className="mr-2 size-4" /> Submit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit “{assessment.title}”</DialogTitle>
          <DialogDescription>
            Provide a written answer, a file, or both. Your student account is attached by the
            backend.
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
            <Label htmlFor="s-answer">Answer</Label>
            <Textarea
              id="s-answer"
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-file">Attachment</Label>
            <Input id="s-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit work"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssessmentsPanel({
  courseCode,
  canManage = false,
  canSubmit = false,
}: {
  courseCode: string;
  canManage?: boolean;
  canSubmit?: boolean;
}) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Assessment | null>(null);

  const query = useQuery({
    queryKey: ["assessments", courseCode],
    queryFn: () => fetchCourseAssessments(courseCode),
    enabled: Boolean(courseCode),
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteAssessment(id),
    onSuccess: () => {
      toast.success("Assessment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assessments", courseCode] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Assessments</h2>
          <p className="text-sm text-muted-foreground">CATs and assignments for {courseCode}.</p>
        </div>
        {canManage ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" /> New assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create assessment</DialogTitle>
                <DialogDescription>
                  The lecturer is assigned automatically by the backend.
                </DialogDescription>
              </DialogHeader>
              <AssessmentForm courseCode={courseCode} onDone={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {query.isLoading ? <RowsSkeleton /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {query.isSuccess && query.data.length === 0 ? (
        <EmptyState title="No assessments" description="Nothing has been set for this course yet." />
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {query.data.map((assessment) => (
            <article key={assessment.id} className="surface-card flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={assessment.assessment_type === "CAT" ? "default" : "secondary"}>
                  {assessment.assessment_type === "CAT" ? "CAT" : "Assignment"}
                </Badge>
                <DueBadge due={assessment.due_date} />
                <span className="ml-auto text-xs text-muted-foreground">
                  #{assessment.id} · {assessment.total_marks} marks
                </span>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">{assessment.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {assessment.description || "No description provided."}
                </p>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Due{" "}
                {assessment.due_date
                  ? new Date(assessment.due_date).toLocaleString()
                  : "not specified"}
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                {canSubmit ? <SubmitDialog assessment={assessment} /> : null}
                {canManage ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setEditing(assessment)}>
                      <Pencil className="mr-2 size-4" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="mr-2 size-4 text-destructive" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete “{assessment.title}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the assessment for all enrolled students.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeMutation.mutate(assessment.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit assessment</DialogTitle>
            <DialogDescription>Update details and save to the backend.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <AssessmentForm
              courseCode={courseCode}
              assessment={editing}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
