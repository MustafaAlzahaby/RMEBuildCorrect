import type { Category } from "@/types";
import { categoryLabel, childrenOf, isDivision } from "@/lib/categories";

export function AdminSectionSelect({
  categories,
  value,
  onChange,
  all = false,
  disabled = false,
  id,
  legacyId,
}: {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  all?: boolean;
  disabled?: boolean;
  id?: string;
  legacyId?: string;
}) {
  const legacy = categories.find((category) => category.id === legacyId && isDivision(category));
  return (
    <select
      id={id}
      aria-label={all ? "Filter by subsection" : "Subsection"}
      value={value}
      required={!all}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
    >
      <option value="">{all ? "All subsections" : "Choose a subsection"}</option>
      {legacy && <option value={legacy.id}>{categoryLabel(legacy)} (current location)</option>}
      {categories.filter(isDivision).map((division) => (
        <optgroup key={division.id} label={categoryLabel(division)}>
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
