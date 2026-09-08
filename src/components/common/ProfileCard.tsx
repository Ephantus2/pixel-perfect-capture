import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurrentUser } from "@/types/auth";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function ProfileCard({ user }: { user: CurrentUser }) {
  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
          {`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()}
        </span>
        <div>
          <CardTitle className="font-display text-xl">
            {user.first_name} {user.last_name}
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-1 capitalize">
              {user.role.toLowerCase()}
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <dl>
          <Row label="Login ID" value={user.login_id} />
          <Row label="Email" value={user.email} />
          {user.role === "STUDENT" ? (
            <>
              <Row label="Programme" value={user.programme} />
              <Row label="Current year" value={user.current_year} />
              <Row label="Admission year" value={user.admission_year} />
            </>
          ) : null}
          {user.role === "LECTURER" ? <Row label="Department" value={user.department} /> : null}
          {user.role === "ADMIN" ? <Row label="Role" value="Administrator" /> : null}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Profile details are read-only — the backend has no profile update endpoint.
        </p>
      </CardContent>
    </Card>
  );
}
