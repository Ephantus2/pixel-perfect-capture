import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchAcademicYears } from "@/api/academicsApi";
import { fetchCoursePerformance } from "@/api/performanceApi";
import { selectedAcademicYear } from "@/utils/academicSelection";
import { deliverFile } from "@/utils/download";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/common/States";

export function AcademicPerformance() {
  const [year, setYear] = useState("");
  const years = useQuery({ queryKey: ["academic-years"], queryFn: fetchAcademicYears, retry: false });
  const results = useQuery({
    queryKey: ["course-performance", year],
    queryFn: () => fetchCoursePerformance(selectedAcademicYear(years.data ?? [], year)),
    enabled: Boolean(year) && Boolean(years.data?.some((item) => item.name === year)),
    retry: false,
  });

  return (
    <section className="space-y-4 border-b border-border pb-6">
      <h2 className="font-display text-lg font-semibold">Academic performance</h2>
      {years.isLoading ? <RowsSkeleton /> : years.isError ? <ErrorState error={years.error} /> : !years.data?.length ? (
        <EmptyState title="No academic years available" description="Academic years have not been added yet." />
      ) : (
        <div className="max-w-sm space-y-2">
          <Label htmlFor="performance-year">Academic year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="performance-year"><SelectValue placeholder="Choose an academic year" /></SelectTrigger>
            <SelectContent>
              {years.data.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}{item.is_current ? " · Current" : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {year && results.isLoading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading results…</p> : null}
      {results.isError ? <ErrorState error={results.error} /> : null}
      {results.data?.kind === "pdf" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">Transcript · {year}</p>
          <Button onClick={() => {
            const result = results.data;
            if (result?.kind === "pdf") void deliverFile(result.blob, result.filename).catch(() => toast.error("Could not download the transcript. Please try again."));
          }}><Download className="mr-2 size-4" /> Download transcript</Button>
        </div>
      ) : null}
      {results.data?.kind === "rows" ? results.data.rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground"><tr><th className="py-3 pr-4 font-medium">Course</th><th className="px-4 py-3 text-right font-medium">Total marks</th><th className="py-3 pl-4 text-right font-medium">Grade</th></tr></thead>
            <tbody>{results.data.rows.map((row) => <tr key={row.id} className="border-b border-border"><td className="py-3 pr-4"><span className="font-medium">{row.course_code}</span><p className="text-muted-foreground">{row.course_name}</p></td><td className="px-4 py-3 text-right tabular-nums">{row.total_marks}</td><td className="py-3 pl-4 text-right font-semibold">{row.grade ?? "Not graded"}</td></tr>)}</tbody>
          </table>
        </div>
      ) : <EmptyState title="No results for this academic year" description="Your course performance will appear once it is available." /> : null}
    </section>
  );
}