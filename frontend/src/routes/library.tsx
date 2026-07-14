import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { LessonCard } from "@/components/LessonCard";
import { listCategories } from "@/api/categories";
import { listLessons } from "@/api/lessons";
import type { Category, Lesson } from "@/types";

export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [lessonResult, setLessonResult] = useState<{
    key: string;
    lessons: Lesson[];
  } | null>(null);
  const [query, setQuery] = useState(q ?? "");
  const lessonRequestKey = `${category ?? ""}:${q ?? ""}`;
  const lessons = lessonResult?.key === lessonRequestKey ? lessonResult.lessons : [];
  const lessonsLoading = lessonResult?.key !== lessonRequestKey;

  useEffect(() => {
    let ignore = false;

    listCategories().then((nextCategories) => {
      if (!ignore) {
        setCategories(nextCategories);
        setCategoriesLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    listLessons({ categoryId: category, search: q }).then((nextLessons) => {
      if (!ignore) {
        setLessonResult({ key: lessonRequestKey, lessons: nextLessons });
      }
    });

    return () => {
      ignore = true;
    };
  }, [category, lessonRequestKey, q]);

  useEffect(() => {
    setQuery(q ?? "");
  }, [q]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === category),
    [categories, category],
  );

  const filteredCategories = useMemo(() => {
    if (!query) return categories;
    const s = query.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s),
    );
  }, [categories, query]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground md:text-4xl">
          {activeCategory
            ? activeCategory.name
            : category && categoriesLoading
              ? "Loading category…"
              : "Field Guide Library"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCategory
            ? activeCategory.description
            : category && categoriesLoading
              ? "Loading category details…"
              : "Find practical how-to guides by category or search the full library."}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories or guides…"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (v) next.set("q", v);
                else next.delete("q");
                return next;
              });
            }}
            className="pl-9 bg-surface border-border"
          />
        </div>
        {category && (
          <Button
            variant="outline"
            onClick={() =>
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("category");
                return next;
              })
            }
          >
            <X className="mr-2 h-4 w-4" /> Clear category
          </Button>
        )}
      </div>

      {!category && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories match your search.</p>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold uppercase tracking-wider text-muted-foreground">
          {category ? "Guides in this category" : "All guides"}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lessonsLoading ? (
            <p className="text-sm text-muted-foreground">Loading guides…</p>
          ) : lessons.length > 0 ? (
            lessons.map((l) => <LessonCard key={l.id} lesson={l} />)
          ) : (
            <p className="text-sm text-muted-foreground">
              No guides found.{" "}
              <Link to="/library" className="text-primary hover:underline">
                Reset filters
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
