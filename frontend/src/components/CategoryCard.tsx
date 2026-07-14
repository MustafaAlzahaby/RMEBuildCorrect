import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[category.icon] ?? Icons.BookOpen;
  return (
    <Link
      to={`/library?category=${encodeURIComponent(category.id)}`}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/60 hover:shadow-red-glow"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-primary-gradient opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-elevated text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {category.lessonCount} guide{category.lessonCount === 1 ? "" : "s"}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{category.description}</p>
    </Link>
  );
}
