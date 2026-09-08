import { useQuery } from "@tanstack/react-query";
import { fetchCourseStatistics } from "@/api/courseApi";
import { ErrorState, RowsSkeleton } from "@/components/common/States";

function label(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatisticsPanel({ courseCode }: { courseCode: string }) {
  const query = useQuery({
    queryKey: ["course-statistics", courseCode],
    queryFn: () => fetchCourseStatistics(courseCode),
    enabled: Boolean(courseCode),
    retry: false,
  });

  if (query.isLoading) return <RowsSkeleton count={2} />;
  if (query.isError) return <ErrorState error={query.error} />;

  const data = query.data ?? {};
  const entries = Object.entries(data);

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">The backend returned no statistics.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="surface-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label(key)}</p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}
