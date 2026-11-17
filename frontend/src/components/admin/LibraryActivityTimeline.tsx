import { useEffect, useState } from "react";
import {
  Activity,
  Columns3,
  Download,
  FileText,
  FolderOpen,
  Layers,
  RefreshCw,
  SquareLibrary,
} from "lucide-react";
import { getLibraryActivity, type ActivityKind } from "@/api/libraryActivity";
import { Button } from "@/components/ui/button";

const activityTypes = {
  category: {
    label: "Category opened",
    plural: "Categories",
    icon: Layers,
    color: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  },
  subcategory: {
    label: "Subcategory opened",
    plural: "Subcategories",
    icon: FolderOpen,
    color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  },
  workspace: {
    label: "Workspace opened",
    plural: "Workspaces",
    icon: SquareLibrary,
    color: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  },
  tab: {
    label: "Tab selected",
    plural: "Tabs",
    icon: Columns3,
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  file: {
    label: "File opened",
    plural: "File opens",
    icon: FileText,
    color: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  download: {
    label: "Download selected",
    plural: "Downloads",
    icon: Download,
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  },
} satisfies Record<
  ActivityKind,
  { label: string; plural: string; icon: typeof Activity; color: string }
>;

const kinds = Object.keys(activityTypes) as ActivityKind[];
const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" });
type ActivityPage = Awaited<ReturnType<typeof getLibraryActivity>>;

export function LibraryActivityTimeline({ userId }: { userId: string }) {
  const [kind, setKind] = useState<ActivityKind | "">("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<{
    userId: string;
    kind: ActivityKind | "";
    page: number;
    refresh: number;
    data?: ActivityPage;
    error?: string;
  }>();
  const current =
    result?.userId === userId &&
    result.kind === kind &&
    result.page === page &&
    result.refresh === refresh
      ? result
      : undefined;
  const counts = result?.userId === userId ? result.data?.counts : undefined;

  useEffect(() => {
    let active = true;
    const request = { userId, kind, page, refresh };
    getLibraryActivity(userId, page, kind).then(
      (data) => {
        if (active) setResult({ ...request, data });
      },
      (error: unknown) => {
        if (active) {
          setResult({
            ...request,
            error: error instanceof Error ? error.message : "Unexpected API error",
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [userId, page, kind, refresh]);

  function filterBy(next: ActivityKind | "") {
    setKind(next);
    setPage(1);
  }

  return (
    <section className="space-y-5" aria-label="Library activity timeline">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {kinds.map((key) => {
          const { plural, icon: Icon, color } = activityTypes[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={kind === key}
              onClick={() => filterBy(kind === key ? "" : key)}
              className="flex min-w-0 items-center gap-2 rounded-xl border bg-card p-3 text-start hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/5"
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-semibold leading-tight tabular-nums">
                  {counts ? (counts[key] ?? 0).toLocaleString() : "—"}
                </span>
                <span className="block text-xs text-muted-foreground">{plural}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">
          {kind ? activityTypes[kind].plural : "All library activity"}
        </h3>
        <div className="flex gap-2">
          {kind && (
            <Button size="sm" variant="ghost" onClick={() => filterBy("")}>
              Clear filter
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPage(1);
              setRefresh(refresh + 1);
            }}
          >
            <RefreshCw aria-hidden="true" /> Refresh
          </Button>
        </div>
      </div>

      {!current && (
        <p className="rounded-xl border p-5 text-sm text-muted-foreground" role="status">
          Loading activity…
        </p>
      )}
      {current && !current.data && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4"
          role="alert"
        >
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">Could not load library activity.</p>
            <p className="break-words text-xs text-muted-foreground">{current.error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setRefresh(refresh + 1)}>
            Retry
          </Button>
        </div>
      )}
      {current?.data?.events.length === 0 && (
        <div className="rounded-xl border border-dashed px-5 py-8 text-center">
          <Activity className="mx-auto mb-3 size-6 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">
            {kind ? "No matching activity" : "No library activity recorded yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {kind
              ? "Clear the filter to see all recorded activity."
              : "New library actions will appear here as the user browses."}
          </p>
        </div>
      )}
      {!!current?.data?.events.length && (
        <ol className="divide-y overflow-hidden rounded-xl border bg-card">
          {current.data.events.map((event) => {
            const { label, icon: Icon, color } = activityTypes[event.kind];
            return (
              <li key={event._id} className="flex items-start gap-3 px-3 py-3.5 sm:px-4">
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {event.inferred ? "Category inferred from subcategory" : label}
                    </span>
                    <time
                      dateTime={event.occurredAt}
                      className="text-xs text-muted-foreground tabular-nums"
                    >
                      {timeFormat.format(new Date(event.occurredAt))}
                    </time>
                  </div>
                  <p className="break-words text-sm font-semibold">{event.title}</p>
                  {event.context && (
                    <p className="mt-0.5 break-words text-xs text-muted-foreground">
                      {event.context}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {current?.data && (page > 1 || current.data.hasNext) && (
        <nav
          aria-label="Library activity pages"
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={!current.data.hasNext}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </section>
  );
}
