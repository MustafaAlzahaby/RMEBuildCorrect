import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LessonCard } from "@/components/LessonCard";
import { Input } from "@/components/ui/input";
import { listCategories } from "@/api/categories";
import { listLessons } from "@/api/lessons";
import { getViewHistory } from "@/api/progress";
import { useAuth } from "@/context/AuthContext";
import { lessonBelongsToCategory } from "@/lib/categories";
import { matchesGuideQuery } from "@/lib/guide-search";
import type { Category, Lesson, ViewHistoryEntry } from "@/types";
import { GuideCategoryBrowser } from "@/components/GuideCategoryBrowser";

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
      const inCategory = lessonBelongsToCategory(
        guide.categoryId,
        selectedCategory ?? undefined,
        categories,
      );
      const matchesSearch = matchesGuideQuery(guide, search, categories);

      return inCategory && matchesSearch;
    });
  }, [guides, query, selectedCategory, categories]);

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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6">
        <p className="mb-2 text-sm text-muted-foreground">Hi, {user.name.split(" ")[0]}</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          What are you working on?
        </h1>
      </header>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search field guides"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. concrete, waterproofing, 033000"
            className="h-14 border-border bg-card pl-12 pr-14 text-lg"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {!query.trim() && (
        <GuideCategoryBrowser
          categories={categories}
          guides={guides}
          value={selectedCategory ?? ""}
          onChange={(value) => setSelectedCategory(value || null)}
        />
      )}
      {recentlyViewed.length > 0 && !query && !selectedCategory && (
        <section className="mb-7">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Recently opened</h2>
          <div className="flex flex-wrap gap-2">
            {recentlyViewed.slice(0, 3).map(({ guide }) => (
              <Link
                key={guide.id}
                to={`/lessons/${guide.id}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </section>
      )}
      {query.trim() && selectedCategory && (
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="mb-6 inline-flex min-h-12 items-center gap-3 rounded-lg border border-border px-4 text-base"
        >
          Searching in {categories.find((item) => item.id === selectedCategory)?.name}{" "}
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Clear discipline filter</span>
        </button>
      )}
      <section aria-label="Guides">
        <h2 className="mb-3 text-2xl font-semibold">
          {query.trim()
            ? "Search results"
            : selectedCategory
              ? categories.find((category) => category.id === selectedCategory)?.name + " guides"
              : "Explore the guides"}
        </h2>
        <p role="status" className="mb-5 text-base text-muted-foreground">
          {filteredGuides.length} guide{filteredGuides.length === 1 ? "" : "s"}
          {query.trim() ? " found" : ""}
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredGuides.map((guide) => (
            <LessonCard key={guide.id} lesson={guide} />
          ))}
        </div>
        {filteredGuides.length === 0 && (
          <div className="rounded-xl border border-border p-6">
            <p>No guides found. Try another word.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCategory(null);
              }}
              className="mt-3 min-h-11 text-sm underline"
            >
              Show all guides
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
