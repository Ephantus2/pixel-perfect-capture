import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { dashboardPathFor } from "@/context/AuthContext";
import { parseApiError } from "@/utils/apiError";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in | Chuo LMS" },
      {
        name: "description",
        content: "Sign in to Chuo LMS with your university login ID to access courses and grades.",
      },
      { property: "og:title", content: "Log in | Chuo LMS" },
      {
        property: "og:description",
        content: "Sign in to Chuo LMS with your university login ID.",
      },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  login_id: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const { login, user, initializing } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { login_id: "", password: "" },
  });

  useEffect(() => {
    if (!initializing && user) navigate({ to: dashboardPathFor(user.role), replace: true });
  }, [initializing, user, navigate]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const details = await login(values);
      toast.success("Login successful");
      navigate({ to: dashboardPathFor(details.role), replace: true });
    } catch (error) {
      const parsed = parseApiError(error);
      for (const [field, message] of Object.entries(parsed.fieldErrors)) {
        if (field in form.getValues()) {
          form.setError(field as keyof FormValues, { message });
        }
      }
      toast.error(parsed.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="auth-backdrop hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-gold text-gold-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold">Chuo LMS</span>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-4xl leading-tight font-semibold">
            One portal for coursework, assessments and results.
          </h2>
          <p className="mt-4 text-sm opacity-80">
            Students enroll in units, lecturers publish materials and grade submissions,
            administrators manage the academic structure.
          </p>
        </div>
        <p className="text-xs opacity-70">Secure sessions using HTTP-only cookies.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the login ID issued by the university.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="login_id">Login ID</Label>
              <Input id="login_id" placeholder="CS/2023/001" {...form.register("login_id")} />
              {form.formState.errors.login_id ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.login_id.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Logging in…
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
