import type { CoursePerformance } from "@/types/academics";

/** Browser-only PDF creation, loaded after performance results arrive. */
export async function performanceTranscript(rows: CoursePerformance[], year: string): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text("Chuo LMS", 15, 20);
  doc.setFontSize(14);
  doc.text("Academic performance transcript", 15, 30);
  doc.setFontSize(11);
  doc.text(`Academic year: ${year}`, 15, 40);
  doc.text("Generated from your course performance results", 15, 48);
  let y = 62;
  for (const row of rows) {
    const name = doc.splitTextToSize(`${row.course_code} - ${row.course_name}`, 125) as string[];
    const height = Math.max(14, name.length * 6 + 6);
    if (y + height > 275) { doc.addPage(); y = 20; }
    doc.text(name, 15, y);
    doc.text(String(row.total_marks), 155, y, { align: "right" });
    doc.text(String(row.grade ?? "Not graded"), 195, y, { align: "right" });
    y += height;
  }
  return doc.output("blob");
}