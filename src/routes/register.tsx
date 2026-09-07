import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/api/authApi";
import { parseApiError } from "@/utils/apiError";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account | Chuo LMS" },
      {
        name: "description",
        content: "Register for Chuo LMS to access university courses, assessments and results.",
      },
      { property: "og:title", content: "Create account | Chuo LMS" },
      { property: "og:description", content: "Register for access to Chuo LMS." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    login_id: z.string().min(1, "Login ID is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
type FormValues = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      login_id: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const data = await registerUser(values);
      toast.success(data.message ?? "User created successfully, please login");
      navigate({ to: "/login", replace: true });
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

  const fields: { name: keyof FormValues; label: string; type?: string; placeholder?: string }[] = [
    { name: "login_id", label: "Login ID", placeholder: "CS/2023/001" },
    { name: "first_name", label: "First name" },
    { name: "last_name", label: "Last name" },
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "confirm_password", label: "Confirm password", type: "password" },
  ];

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
            Register once, then follow every unit you take.
          </h2>
          <p className="mt-4 text-sm opacity-80">
            Your role is assigned by the university records office after registration.
          </p>
        </div>
        <p className="text-xs opacity-70">Your password is never stored in the browser.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All fields are required by the records system.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.name === "login_id" || field.name === "email"
                      ? "space-y-2 sm:col-span-2"
                      : "space-y-2"
                  }
                >
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    {...form.register(field.name)}
                  />
                  {form.formState.errors[field.name] ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors[field.name]?.message}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Creating account…
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
