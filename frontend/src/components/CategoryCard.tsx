import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import type { Category } from "@/types";
import { categoryLabel, isDivision } from "@/lib/categories";

export const categoryCardClassName =
  "group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/60 hover:shadow-red-glow";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/library?category=${encodeURIComponent(category.id)}`}
      className={
        isDivision(category)
          ? categoryCardClassName
          : "group relative rounded-md border border-border border-l-2 border-l-primary/40 bg-background/60 p-3.5 transition-colors hover:border-primary/60 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      }
    >
      <CategoryCardContent category={category} />
    </Link>
  );
}

export function CategoryCardContent({ category }: { category: Category }) {
  const Icon =
    (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.BookOpen;
  const section = !isDivision(category);

  if (section) {
    return (
      <>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded bg-primary/10 px-2 py-1 font-mono text-xs font-bold tracking-widest text-primary">
            {category.code || "SECTION"}
          </span>
          <Icons.ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          />
        </div>
        <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">{category.name}</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {category.lessonCount} guide{category.lessonCount === 1 ? "" : "s"}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-x-0 top-0 h-1 bg-primary-gradient opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-elevated text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {section ? <Icons.ClipboardList className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
        </div>
        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {category.lessonCount} guide{category.lessonCount === 1 ? "" : "s"}
        </span>
      </div>
      {category.code && (
        <p className="mt-4 font-mono text-sm font-bold tracking-[0.18em] text-primary">
          {isDivision(category) ? `DIVISION ${category.code}` : category.code}
        </p>
      )}
      <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {category.description || categoryLabel(category)}
      </p>
    </>
  );
}
