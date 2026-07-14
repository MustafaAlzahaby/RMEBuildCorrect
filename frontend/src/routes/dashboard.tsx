import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock3, Search, X } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LessonCard } from "@/components/LessonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCategories } from "@/api/categories";
import { listLessons } from "@/api/lessons";
import { getViewHistory } from "@/api/progress";
import { useAuth } from "@/context/AuthContext";
import type { Category, Lesson, ViewHistoryEntry } from "@/types";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<Lesson[]>([]);
  const [history, setHistory] = useState<ViewHistoryEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setError(null);

    Promise.all([listCategories(), listLessons(), getViewHistory()])
      .then(([nextCategories, nextGuides, nextHistory]) => {
        if (!cancelled) {
          setCategories(nextCategories);
          setGuides(nextGuides);
          setHistory(nextHistory);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load your guide");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredGuides = useMemo(() => {
    const search = query.trim().toLowerCase();

    return guides.filter((guide) => {
      const inCategory = !selectedCategory || guide.categoryId === selectedCategory;
      const matchesSearch =
        !search ||
        guide.title.toLowerCase().includes(search) ||
        guide.description.toLowerCase().includes(search) ||
        guide.categoryName.toLowerCase().includes(search);

      return inCategory && matchesSearch;
    });
  }, [guides, query, selectedCategory]);

  const recentlyViewed = useMemo(() => {
    const guideById = new Map(guides.map((guide) => [guide.id, guide]));
    return history
      .map((entry) => ({ guide: guideById.get(entry.guideId), viewedAt: entry.viewedAt }))
      .filter((entry): entry is { guide: Lesson; viewedAt: string } => Boolean(entry.guide));
  }, [guides, history]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (!user || loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading your field guide…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-primary">Welcome, {user.name}</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl">
          What do you need help with?
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Search the field guide or browse a category to find the right procedure for the job.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guides, categories, or tasks…"
            className="h-11 border-border bg-surface pl-9"
          />
        </div>
        {(query || selectedCategory) && (
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setSelectedCategory(null);
            }}
          >
            <X className="mr-2 h-4 w-4" /> Clear filters
          </Button>
        )}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wider">Browse Categories</h2>
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3 pb-3">
            <CategoryFilter
              active={selectedCategory === null}
              label="All guides"
              count={guides.length}
              onClick={() => setSelectedCategory(null)}
            />
            {categories
              .filter((category) => category.lessonCount > 0)
              .map((category) => (
                <CategoryFilter
                  key={category.id}
                  active={selectedCategory === category.id}
                  label={category.name}
                  count={category.lessonCount}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && !query && !selectedCategory && (
        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold uppercase tracking-wider">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyViewed.slice(0, 6).map(({ guide, viewedAt }) => (
              <Link
                key={guide.id}
                to={`/lessons/${guide.id}`}
                className="rounded-md border border-border bg-surface p-4 transition-colors hover:border-primary/60"
              >
                <p className="font-medium text-foreground">{guide.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {guide.categoryName} · Viewed {formatDate(viewedAt)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold uppercase tracking-wider">
              {selectedCategory
                ? categories.find((category) => category.id === selectedCategory)?.name
                : "Available Guides"}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredGuides.length} guide{filteredGuides.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGuides.map((guide) => (
            <LessonCard key={guide.id} lesson={guide} />
          ))}
          {filteredGuides.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No guides match your search. Try another word or clear the filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryFilter({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-44 rounded-lg border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary/10 shadow-red-glow"
          : "border-border bg-card hover:border-primary/60"
      }`}
    >
      <span className="block font-display font-semibold uppercase tracking-wide">{label}</span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {count} guide{count === 1 ? "" : "s"}
      </span>
    </button>
  );
}
