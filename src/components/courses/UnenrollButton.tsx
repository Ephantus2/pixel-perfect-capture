import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { unenrollCourse } from "@/api/courseApi";
import { apiErrorMessage } from "@/utils/apiError";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function UnenrollButton({ courseCode }: { courseCode: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => unenrollCourse(courseCode),
    onSuccess: (data) => {
      if (data?.Error) {
        toast.error(data.Error);
        return;
      }
      toast.success(data?.message ?? "Successfully unenrolled");
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? "Unenrolling…" : "Unenroll"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unenroll from {courseCode}?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to its materials and assessments until you enroll again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>Unenroll</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
