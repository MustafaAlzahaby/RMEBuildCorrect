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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    listLessons({ categoryId: category, search: q }).then(setLessons);
  }, [category, q]);

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
          {activeCategory ? activeCategory.name : "Training Library"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCategory
            ? activeCategory.description
            : "Explore lessons by category or search across the full library."}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories or lessons…"
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
        {activeCategory && (
          <Button
            variant="outline"
            onClick={() => setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.delete("category");
              return next;
            })}
          >
            <X className="mr-2 h-4 w-4" /> Clear category
          </Button>
        )}
      </div>

      {!activeCategory && (
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
          {activeCategory ? "Lessons in this category" : "All lessons"}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lessons.map((l) => (
            <LessonCard key={l.id} lesson={l} />
          ))}
          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No lessons found.{" "}
              <Link to="/library" className="text-primary hover:underline">Reset filters</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
