import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createCourse, deleteCourse, updateCourse } from "@/api/courseApi";
import { parseApiError } from "@/utils/apiError";
import { AdminRoute } from "@/components/auth/RoleRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export const Route = createFileRoute("/admin/courses")({
  head: () => ({
    meta: [
      { title: "Course management | Chuo LMS" },
      { name: "description", content: "Create, update and delete university courses." },
      { property: "og:title", content: "Course management | Chuo LMS" },
      { property: "og:description", content: "Create, update and delete university courses." },
    ],
  }),
  component: () => (
    <AdminRoute title="Course management" description="Create, update and delete courses">
      <AdminCourses />
    </AdminRoute>
  ),
});

const schema = z.object({
  code: z.string().min(1, "Course code is required"),
  name: z.string().min(1, "Course name is required"),
  lecturer: z.coerce.number().int().positive("Lecturer ID must be a positive number"),
  programme: z.coerce.number().int().positive("Programme ID must be a positive number"),
  description: z.string().min(1, "Description is required"),
});
type FormValues = z.input<typeof schema>;

function CourseForm({ mode }: { mode: "create" | "update" }) {
  const [courseId, setCourseId] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", lecturer: "", programme: "", description: "" } as never,
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = schema.parse(values);
      return mode === "create" ? createCourse(payload) : updateCourse(Number(courseId), payload);
    },
    onSuccess: () => {
      toast.success(mode === "create" ? "Course created successfully" : "Course updated successfully");
      if (mode === "create") form.reset();
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      for (const [field, message] of Object.entries(parsed.fieldErrors)) {
        if (field in form.getValues()) form.setError(field as keyof FormValues, { message });
      }
      toast.error(parsed.message);
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      {mode === "update" ? (
        <div className="space-y-2">
          <Label htmlFor="course-id">Course ID</Label>
          <Input
            id="course-id"
            type="number"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          />
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-code`}>Course code</Label>
          <Input id={`${mode}-code`} placeholder="CSC301" {...form.register("code")} />
          {form.formState.errors.code ? (
            <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-name`}>Course name</Label>
          <Input id={`${mode}-name`} placeholder="Database Systems" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-lecturer`}>Lecturer ID</Label>
          <Input id={`${mode}-lecturer`} type="number" {...form.register("lecturer")} />
          {form.formState.errors.lecturer ? (
            <p className="text-xs text-destructive">{form.formState.errors.lecturer.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${mode}-programme`}>Programme ID</Label>
          <Input id={`${mode}-programme`} type="number" {...form.register("programme")} />
          {form.formState.errors.programme ? (
            <p className="text-xs text-destructive">{form.formState.errors.programme.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${mode}-description`}>Description</Label>
          <Textarea id={`${mode}-description`} rows={4} {...form.register("description")} />
          {form.formState.errors.description ? (
            <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
          ) : null}
        </div>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            {mode === "create" ? "Creating course…" : "Saving…"}
          </>
        ) : mode === "create" ? (
          "Create course"
        ) : (
          "Update course"
        )}
      </Button>
    </form>
  );
}

function DeleteCourse() {
  const [id, setId] = useState("");
  const mutation = useMutation({
    mutationFn: () => deleteCourse(Number(id)),
    onSuccess: () => {
      toast.success("Course deleted successfully");
      setId("");
    },
    onError: (error) => toast.error(parseApiError(error).message),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="delete-id">Course ID</Label>
        <Input id="delete-id" type="number" value={id} onChange={(e) => setId(e.target.value)} />
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={!id || mutation.isPending}>
            <Trash2 className="mr-2 size-4" /> Delete course
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course #{id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the course and everything the backend cascades with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => mutation.mutate()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AdminCourses() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Course directory — coming soon</AlertTitle>
        <AlertDescription>
          There is no endpoint that lists all courses, so courses are managed by ID and code. Use
          the course page to view a single course by code.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage courses</CardTitle>
          <CardDescription>
            Lecturer and programme are sent as numeric IDs, as the Django serializer expects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="update">Update</TabsTrigger>
              <TabsTrigger value="delete">Delete</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="pt-6">
              <CourseForm mode="create" />
            </TabsContent>
            <TabsContent value="update" className="pt-6">
              <CourseForm mode="update" />
            </TabsContent>
            <TabsContent value="delete" className="pt-6">
              <DeleteCourse />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
