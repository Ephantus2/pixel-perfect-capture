import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createProfile } from "@/api/authApi";
import { fetchDepartments, fetchProgrammes } from "@/api/academicsApi";
import { apiErrorMessage } from "@/utils/apiError";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, RowsSkeleton } from "@/components/common/States";

const FIRST_ADMISSION_YEAR = 2020;

function admissionYears() {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= FIRST_ADMISSION_YEAR; y -= 1) years.push(y);
  return years;
}

export function ProfileSetup() {
  const { user, refresh } = useAuth();
  const isLecturer = user?.role === "LECTURER";

  const [programme, setProgramme] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [department, setDepartment] = useState("");

  const programmes = useQuery({
    queryKey: ["programmes"],
    queryFn: fetchProgrammes,
    enabled: !isLecturer,
    retry: false,
  });
  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled: isLecturer,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createProfile(
        isLecturer
          ? { department: Number(department) }
          : {
              programme: Number(programme),
              current_year: Number(currentYear),
              admission_year: Number(admissionYear),
            },
      ),
    onSuccess: async () => {
      toast.success("Profile created successfully");
      await refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const listQuery = isLecturer ? departments : programmes;
  const ready = isLecturer
    ? Boolean(department)
    : Boolean(programme && currentYear && admissionYear);

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="font-display text-xl">Complete your profile</CardTitle>
        <CardDescription>
          {isLecturer
            ? "Tell us which department you belong to before you can teach on Chuo LMS."
            : "Tell us about your studies before you can enrol in units and submit work."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {listQuery.isLoading ? <RowsSkeleton count={1} /> : null}
        {listQuery.isError ? <ErrorState error={listQuery.error} /> : null}

        {listQuery.isSuccess ? (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (ready) mutation.mutate();
            }}
          >
            {isLecturer ? (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.data?.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                        {d.code ? ` (${d.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="programme">Programme</Label>
                  <Select value={programme} onValueChange={setProgramme}>
                    <SelectTrigger id="programme">
                      <SelectValue placeholder="Select your programme" />
                    </SelectTrigger>
                    <SelectContent>
                      {programmes.data?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                          {p.code ? ` (${p.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-year">Year of study</Label>
                    <Select value={currentYear} onValueChange={setCurrentYear}>
                      <SelectTrigger id="current-year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            Year {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission-year">Admission year</Label>
                    <Select value={admissionYear} onValueChange={setAdmissionYear}>
                      <SelectTrigger id="admission-year">
                        <SelectValue placeholder="Year admitted" />
                      </SelectTrigger>
                      <SelectContent>
                        {admissionYears().map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={!ready || mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Saving profile…
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 size-4" /> Create profile
                </>
              )}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
