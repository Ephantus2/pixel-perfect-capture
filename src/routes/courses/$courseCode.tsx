import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchEnrolledCourses } from "@/api/courseApi";
import { ProtectedRoute } from "@/components/auth/RoleRoute";
import { AssessmentsPanel } from "@/components/assessments/AssessmentsPanel";
import { MaterialsPanel } from "@/components/courses/MaterialsPanel";
import { StatisticsPanel } from "@/components/courses/StatisticsPanel";
import { ComingSoon } from "@/components/common/States";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { courseLecturerName, courseProgrammeName } from "@/types/course";

export const Route = createFileRoute("/courses/$courseCode")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.courseCode} | Chuo LMS` },
      {
        name: "description",
        content: `Overview, materials and assessments for course ${params.courseCode}.`,
      },
      { property: "og:title", content: `${params.courseCode} | Chuo LMS` },
      {
        property: "og:description",
        content: `Overview, materials and assessments for ${params.courseCode}.`,
      },
    ],
  }),
  component: CourseRoute,
});

function CourseRoute() {
  const { courseCode } = Route.useParams();
  return (
    <ProtectedRoute title={courseCode} description="Course workspace">
      <CourseDetail courseCode={courseCode} />
    </ProtectedRoute>
  );
}

function Overview({ courseCode }: { courseCode: string }) {
  const { user } = useAuth();
  const enrolled = useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: fetchEnrolledCourses,
    enabled: user?.role === "STUDENT",
    retry: false,
  });

  const course = enrolled.data?.find(
    (c) => String(c.code).toUpperCase() === courseCode.toUpperCase(),
  );

  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary" className="w-fit font-mono">
          {courseCode}
        </Badge>
        <CardTitle className="font-display text-2xl">{course?.name ?? courseCode}</CardTitle>
        <CardDescription>
          {course?.description ??
            "The backend has no single-course endpoint, so details appear here only for units you are enrolled in."}
        </CardDescription>
      </CardHeader>
      {course ? (
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Lecturer</p>
            <p className="text-sm font-medium">
              {courseLecturerName(course) ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Programme</p>
            <p className="text-sm font-medium">
              {courseProgrammeName(course) ?? "—"}
            </p>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function CourseDetail({ courseCode }: { courseCode: string }) {
  const { user } = useAuth();
  const role = user?.role;

  const tabs =
    role === "ADMIN"
      ? ["overview", "statistics", "management"]
      : role === "LECTURER"
        ? ["overview", "materials", "assessments", "statistics"]
        : ["overview", "materials", "assessments"];

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="capitalize">
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <Overview courseCode={courseCode} />
      </TabsContent>

      {tabs.includes("materials") ? (
        <TabsContent value="materials">
          <MaterialsPanel courseCode={courseCode} canManage={role === "LECTURER"} />
        </TabsContent>
      ) : null}

      {tabs.includes("assessments") ? (
        <TabsContent value="assessments">
          <AssessmentsPanel
            courseCode={courseCode}
            canManage={role === "LECTURER"}
            canSubmit={role === "STUDENT"}
          />
        </TabsContent>
      ) : null}

      {tabs.includes("statistics") ? (
        <TabsContent value="statistics">
          <StatisticsPanel courseCode={courseCode} />
        </TabsContent>
      ) : null}

      {tabs.includes("management") ? (
        <TabsContent value="management">
          <ComingSoon
            feature="Per-course management"
            note="Courses are updated and deleted by ID from Course management — the backend has no lookup by code."
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
