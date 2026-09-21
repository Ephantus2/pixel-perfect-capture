import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteMaterial,
  fetchCourseMaterials,
  updateMaterial,
  uploadMaterial,
} from "@/api/courseApi";
import { apiErrorMessage } from "@/utils/apiError";
import { fileName, fileUrl } from "@/utils/fileUrl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CourseMaterial } from "@/types/course";

function MaterialForm({
  courseCode,
  material,
  onDone,
}: {
  courseCode: string;
  material?: CourseMaterial;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(material?.title ?? "");
  const [course, setCourse] = useState(
    material?.course != null ? String(material.course) : courseCode,
  );
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (material) {
        return updateMaterial(material.id, { course, title, file });
      }
      if (!file) throw new Error("Select a file to upload");
      return uploadMaterial({ course, title, file });
    },
    onSuccess: () => {
      toast.success(material ? "Material updated successfully" : "Material uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["materials", courseCode] });
      onDone();
    },
    onError: (error) =>
      toast.error(error instanceof Error && !("response" in error) ? error.message : apiErrorMessage(error)),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="material-course">Course</Label>
        <Input
          id="material-course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Sent as the <code>course</code> field. Use the value your Django serializer expects
          (course ID or code).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="material-title">Title</Label>
        <Input
          id="material-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Week 1 — Lecture notes"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="material-file">File {material ? "(optional)" : ""}</Label>
        <Input
          id="material-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {material ? "Saving…" : "Uploading material…"}
            </>
          ) : material ? (
            "Save changes"
          ) : (
            "Upload material"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function MaterialsPanel({
  courseCode,
  canManage,
}: {
  courseCode: string;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CourseMaterial | null>(null);

  const query = useQuery({
    queryKey: ["materials", courseCode],
    queryFn: () => fetchCourseMaterials(courseCode),
    enabled: Boolean(courseCode),
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteMaterial(id),
    onSuccess: () => {
      toast.success("Material deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["materials", courseCode] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Course materials</h2>
          <p className="text-sm text-muted-foreground">Files published for {courseCode}.</p>
        </div>
        {canManage ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" /> Upload material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload course material</DialogTitle>
                <DialogDescription>
                  Sent as multipart/form-data. The lecturer is assigned by the backend.
                </DialogDescription>
              </DialogHeader>
              <MaterialForm courseCode={courseCode} onDone={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {query.isLoading ? <RowsSkeleton /> : null}
      {query.isError ? <ErrorState error={query.error} /> : null}
      {query.isSuccess && query.data.length === 0 ? (
        <EmptyState title="No materials yet" description="Nothing has been published for this course." />
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <ul className="space-y-2">
          {query.data.map((material) => (
            <li
              key={material.id}
              className="surface-card flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <FileText className="size-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{material.title}</p>
                {material.uploaded_at ? (
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(material.uploaded_at).toLocaleString()}
                  </p>
                ) : null}
              </div>
              {fileUrl(material.file) ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <a href={fileUrl(material.file)!} target="_blank" rel="noreferrer">
                      <FileText className="mr-2 size-4" /> View
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={fileUrl(material.file)!} download={fileName(material.file)}>
                      <Download className="mr-2 size-4" /> Download
                    </a>
                  </Button>
                </>
              ) : null}
              {canManage ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(material)}>
                    <Pencil className="size-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this material?</AlertDialogTitle>
                        <AlertDialogDescription>
                          “{material.title}” will be permanently removed from the course.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeMutation.mutate(material.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update material</DialogTitle>
            <DialogDescription>Leave the file empty to keep the current one.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <MaterialForm
              courseCode={courseCode}
              material={editing}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
