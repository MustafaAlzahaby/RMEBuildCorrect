import type { Category } from "@/types";
import { categoryLabel, childrenOf, isDivision } from "@/lib/categories";

export function GuideCategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label="Filter guides by discipline or section"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full min-w-0 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-64"
    >
      <option value="">All disciplines</option>
      {categories.filter(isDivision).map((division) => (
        <optgroup key={division.id} label={categoryLabel(division)}>
          <option value={division.id}>{division.name} — all sections</option>
          {childrenOf(categories, division.id).map((section) => (
            <option key={section.id} value={section.id}>
              {categoryLabel(section)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
