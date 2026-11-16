import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserActivity, type AdminUser, type UserActivityPage } from "@/api/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function formatDate(value: string | null) {
  return value ? dateTime.format(new Date(value)) : "—";
}

export function UserActivityDialog({ user }: { user: AdminUser }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" aria-label={`View activity for ${user.name}`}>
          View activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{user.name} · Guide activity</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <ActivityHistory user={user} />
      </DialogContent>
    </Dialog>
  );
}

function ActivityHistory({ user }: { user: AdminUser }) {
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ page: number; retry: number; data?: UserActivityPage }>();
  const current = result?.page === page && result.retry === retry ? result : undefined;

  useEffect(() => {
    let active = true;
    getUserActivity(user.id, page).then(
      (data) => {
        if (active) setResult({ page, retry, data });
      },
      () => {
        if (active) setResult({ page, retry });
      },
    );
    return () => {
      active = false;
    };
  }, [user.id, page, retry]);

  const summary = user.progressSummary;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {summary.guideViews} distinct guides opened · {summary.trackedOpens} tracked opens ·{" "}
        {summary.completedGuides} self-reported reviews. Last opened{" "}
        {formatDate(summary.lastViewedAt)}.
      </p>
      {!current && <p role="status">Loading guide activity…</p>}
      {current && !current.data && (
        <div role="alert">
          Could not load guide activity.{" "}
          <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
            Retry
          </Button>
        </div>
      )}
      {current?.data && (
        <>
          {current.data.guides.length === 0 && <p>No guide activity recorded.</p>}
          <ul className="divide-y rounded-md border">
            {current.data.guides.map((guide) => (
              <li key={guide.id} className="space-y-2 p-3">
                {guide.guideId ? (
                  <Link
                    to={`/lessons/${guide.guideId}`}
                    className="font-medium text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {guide.title}
                  </Link>
                ) : (
                  <span className="font-medium">Guide unavailable</span>
                )}
                <dl className="grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Last opened</dt>
                    <dd>{formatDate(guide.lastOpenedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tracked opens</dt>
                    <dd>{guide.trackedOpens}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Review reported</dt>
                    <dd>{formatDate(guide.completedAt)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          {(page > 1 || current.data.hasNext) && (
            <nav aria-label="Guide activity pages" className="flex flex-wrap items-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                variant="outline"
                disabled={!current.data.hasNext}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
