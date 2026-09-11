import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { enrollCourse } from "@/api/courseApi";
import { apiErrorMessage } from "@/utils/apiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EnrollDialog({ variant = "default" }: { variant?: "default" | "outline" }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => enrollCourse(code.trim().toUpperCase()),
    onSuccess: (data) => {
      if (data?.Error) {
        toast.error(data.Error);
        return;
      }
      toast.success(data?.message ?? "Successfully enrolled");
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
      setCode("");
      setOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          <Plus className="mr-2 size-4" /> Enroll in a course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in a course</DialogTitle>
          <DialogDescription>Enter the course code exactly as published.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="enroll-code">Course code</Label>
            <Input
              id="enroll-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CSC301"
              className="uppercase"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Enrolling…
                </>
              ) : (
                "Enroll"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
