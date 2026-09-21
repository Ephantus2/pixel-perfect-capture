import { Link } from "@tanstack/react-router";
import { BookOpen, UserRound, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { courseLecturerName, courseProgrammeName, type Course } from "@/types/course";

function text(value: unknown) {
  if (value == null || value === "") return null;
  return String(value);
}

export function CourseCard({ course, action }: { course: Course; action?: React.ReactNode }) {
  const code = text(course.code) ?? "—";
  const lecturer = courseLecturerName(course);
  const programme = courseProgrammeName(course);

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-[var(--shadow-card)]">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="font-mono">
            {code}
          </Badge>
          <BookOpen className="size-4 text-muted-foreground" />
        </div>
        <CardTitle className="font-display text-lg leading-snug">
          {text(course.name) ?? "Untitled course"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {text(course.description) ?? "No description provided."}
        </p>
        <dl className="space-y-1 text-xs text-muted-foreground">
          {lecturer ? (
            <div className="flex items-center gap-2">
              <UserRound className="size-3.5" />
              <span>Lecturer: {lecturer}</span>
            </div>
          ) : null}
          {programme ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="size-3.5" />
              <span>Programme: {programme}</span>
            </div>
          ) : null}
        </dl>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/courses/$courseCode" params={{ courseCode: code }}>
            View course
          </Link>
        </Button>
        {action}
      </CardFooter>
    </Card>
  );
}
