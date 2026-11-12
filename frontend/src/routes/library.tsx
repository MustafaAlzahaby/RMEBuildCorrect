import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LessonCard } from "@/components/LessonCard";
import { GuideCategoryBrowser } from "@/components/GuideCategoryBrowser";
import { listCategories } from "@/api/categories";
import { listLessons } from "@/api/lessons";
import { lessonBelongsToCategory } from "@/lib/categories";
import { matchesGuideQuery } from "@/lib/guide-search";
import type { Category, Lesson } from "@/types";

export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([listCategories(), listLessons()])
      .then(([nextCategories, nextGuides]) => {
        if (!ignore) {
          setCategories(nextCategories);
          setGuides(nextGuides);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Unable to load guides");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const results = useMemo(
    () =>
      guides.filter(
        (guide) =>
          lessonBelongsToCategory(guide.categoryId, category || undefined, categories) &&
          matchesGuideQuery(guide, query, categories),
      ),
    [guides, category, categories, query],
  );

  function updateFilter(key: string, value: string) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Find a guide</h1>
        <p className="mt-2 text-base text-muted-foreground">Search the job you need to do.</p>
      </header>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search the field guide library"
            placeholder="e.g. concrete, waterproofing, 033000"
            value={query}
            onChange={(event) => updateFilter("q", event.target.value)}
            className="h-14 border-border bg-card pl-12 pr-14 text-lg"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => updateFilter("q", "")}
              className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {!query.trim() && !loading && !error && (
        <GuideCategoryBrowser
          categories={categories}
          guides={guides}
          value={category}
          onChange={(value) => updateFilter("category", value)}
        />
      )}
      {query.trim() && category && (
        <button
          type="button"
          onClick={() => updateFilter("category", "")}
          className="mb-6 inline-flex min-h-12 items-center gap-3 rounded-lg border border-border px-4 text-base"
        >
          Searching in {categories.find((item) => item.id === category)?.name}{" "}
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Clear discipline filter</span>
        </button>
      )}
      {error ? (
        <div role="alert" className="rounded-xl border border-border bg-card p-5">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 min-h-11 text-sm underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <section aria-label="Guides" aria-busy={loading}>
          <h2 className="mb-3 text-2xl font-semibold">
            {query.trim()
              ? "Search results"
              : category
                ? categories.find((item) => item.id === category)?.name + " guides"
                : "Explore the guides"}
          </h2>
          <p role="status" className="mb-5 text-base text-muted-foreground">
            {loading
              ? "Loading guides…"
              : `${results.length} guide${results.length === 1 ? "" : "s"}${query.trim() ? " found" : ""}`}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((guide) => (
              <LessonCard key={guide.id} lesson={guide} />
            ))}
          </div>
          {!loading && results.length === 0 && (
            <div className="rounded-xl border border-border p-6">
              <p>No guides found. Try another word.</p>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="mt-3 min-h-11 text-sm underline"
              >
                Show all guides
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
