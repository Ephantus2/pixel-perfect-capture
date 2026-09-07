import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Hammer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiErrorMessage, parseApiError } from "@/utils/apiError";

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const parsed = parseApiError(error);
  const notFound = parsed.status === 404;
  return (
    <Alert variant={notFound ? "default" : "destructive"}>
      <AlertTriangle className="size-4" />
      <AlertTitle>{notFound ? "Not available from the backend" : "Request failed"}</AlertTitle>
      <AlertDescription>
        {notFound
          ? "This endpoint returned 404. The data may not exist yet on the Django backend."
          : apiErrorMessage(error)}
      </AlertDescription>
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Inbox className="size-8 text-muted-foreground" />
      <div>
        <p className="font-display text-base font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ComingSoon({ feature, note }: { feature: string; note?: string }) {
  return (
    <div className="surface-card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Hammer className="size-7 text-muted-foreground" />
      <p className="font-display text-base font-semibold">{feature} — Coming soon</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {note ?? "The Django backend does not expose an endpoint for this yet."}
      </p>
    </div>
  );
}
