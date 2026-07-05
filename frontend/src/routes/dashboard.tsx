import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Progress } from "@/components/ui/progress";
import { getDashboardSummary } from "@/api/progress";
import { useAuth } from "@/context/AuthContext";
import type { DashboardSummary } from "@/types";
import { formatDate } from "@/utils";

export function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setError(null);

    getDashboardSummary(user.id)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in again. If the problem continues, restart the frontend and backend.
        </p>
      </div>
    );
  }

  if (!user || !summary) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Welcome back</p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl">
            {user.name}
          </h1>
        </div>
        <div className="flex gap-3">
          <Stat icon={Award} label="Overall" value={`${summary.overallPercent}%`} />
          <Stat icon={CheckCircle2} label="Completed" value={`${summary.completedCount}/${summary.totalCount}`} />
        </div>
      </header>

      {/* Overall progress */}
      <section className="mt-8 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wider">Overall Progress</h2>
          <span className="font-display text-2xl text-primary">{summary.overallPercent}%</span>
        </div>
        <Progress value={summary.overallPercent} className="mt-3 h-3" />
        <p className="mt-2 text-sm text-muted-foreground">
          You've completed {summary.completedCount} of {summary.totalCount} lessons across all categories.
        </p>
      </section>

      {/* Per category */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wider">Progress by Category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.perCategory.map((c) => {
            const pct = c.total ? Math.round((c.completed / c.total) * 100) : 0;
            return (
              <div key={c.categoryId} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-display font-semibold uppercase tracking-wide">{c.categoryName}</h3>
                  <span className="text-sm text-muted-foreground">{c.completed}/{c.total}</span>
                </div>
                <Progress value={pct} className="mt-3 h-2" />
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">{pct}% done</span>
                  <Link
                    to={`/library?category=${encodeURIComponent(c.categoryId)}`}
                    className="text-primary hover:underline"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recently completed */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wider">Recently Completed</h2>
        {summary.recentlyCompleted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing yet — start with the{" "}
            <Link to="/library" className="text-primary hover:underline">library</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {summary.recentlyCompleted.map(({ lesson, completedAt }) => (
              <li key={lesson.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600/15 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <Link to={`/lessons/${lesson.id}`} className="font-medium hover:text-primary">
                      {lesson.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{lesson.categoryName} • {formatDate(completedAt)}</p>
                  </div>
                </div>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}
