import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadBulkMarks } from "@/api/assessmentApi";
import { bulkMarksPayload, type BulkMarkInput } from "@/utils/grading";
import { apiErrorMessage } from "@/utils/apiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/common/States";

export function BulkMarksPanel({ assessmentId, totalMarks }: { assessmentId: number; totalMarks?: number | undefined }) {
  const [rows, setRows] = useState<BulkMarkInput[]>([{ registration_number: "", marks: "" }]);
  const [saved, setSaved] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => uploadBulkMarks(assessmentId, bulkMarksPayload(rows, totalMarks)),
    onSuccess: (data) => {
      setSaved(`${data.message} ${data.students_processed} students processed.`);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["grade"] });
      queryClient.invalidateQueries({ queryKey: ["course-performance"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
  function change(index: number, field: keyof BulkMarkInput, value: string) {
    setSaved(null);
    setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
  }
  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setSaved(null); mutation.mutate(); }}>
      <h3 className="font-display text-base font-semibold">Physical assessment marks</h3>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_2.5rem] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_2.5rem]">
            <div className="space-y-2"><Label htmlFor={`reg-${index}`}>Registration number</Label><Input id={`reg-${index}`} value={row.registration_number} onChange={(event) => change(index, "registration_number", event.target.value)} required disabled={mutation.isPending} /></div>
            <div className="space-y-2"><Label htmlFor={`mark-${index}`}>Marks</Label><Input id={`mark-${index}`} type="number" min={0} max={totalMarks} step="0.01" value={row.marks} onChange={(event) => change(index, "marks", event.target.value)} required disabled={mutation.isPending} /></div>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove student ${index + 1}`} title="Remove student" disabled={rows.length === 1 || mutation.isPending} onClick={() => { setSaved(null); setRows((current) => current.filter((_, i) => i !== index)); }}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => { setSaved(null); setRows((current) => [...current, { registration_number: "", marks: "" }]); }}><Plus className="mr-2 size-4" /> Add student</Button>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />} Save marks</Button>
      </div>
      {mutation.isError ? <ErrorState error={mutation.error} /> : null}
      {saved ? <p role="status" className="text-sm text-success">{saved}</p> : null}
    </form>
  );
}