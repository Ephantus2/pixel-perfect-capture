import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fetchTeachingCourses } from "@/api/courseApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, EmptyState } from "@/components/common/States";
import { CourseCodePicker } from "@/components/courses/CourseCodePicker";

export function useTeachingCourses() {
  return useQuery({
    queryKey: ["teaching-courses"],
    queryFn: fetchTeachingCourses,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Dropdown of the courses the signed-in lecturer teaches
 * (GET /courses/teaching/courses/), so they never have to type a code.
 */
export function TeachingCourseSelect({
  value,
  onSelect,
  label = "Choose a course you teach",
  description = "Pick one of your courses to continue.",
  autoSelectFirst = false,
}: {
  value: string;
  onSelect: (code: string) => void;
  label?: string;
  description?: string;
  autoSelectFirst?: boolean;
}) {
  const query = useTeachingCourses();
  const courses = query.data ?? [];

  useEffect(() => {
    if (autoSelectFirst && !value && courses.length === 1 && courses[0]?.code) {
      onSelect(String(courses[0].code));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectFirst, value, courses.length]);

  if (query.isError) {
    return (
      <div className="space-y-4">
        <ErrorState error={query.error} />
        <CourseCodePicker value={value} onSelect={onSelect} label="Open a course by code" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {query.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your courses…
          </p>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses assigned"
            description="You are not assigned to any course yet."
          />
        ) : (
          <Select value={value || undefined} onValueChange={onSelect}>
            <SelectTrigger className="w-full sm:max-w-md">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.code)}>
                  {course.code} — {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
