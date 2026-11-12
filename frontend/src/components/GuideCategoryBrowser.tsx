import type { CSSProperties } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { BookOpen, ChevronDown, Layers } from "lucide-react";
import type { Category, Lesson } from "@/types";
import { childrenOf, isDivision, lessonBelongsToCategory, parentOf } from "@/lib/categories";

export function GuideCategoryBrowser({
  categories,
  guides,
  value,
  onChange,
}: {
  categories: Category[];
  guides: Lesson[];
  value: string;
  onChange: (value: string) => void;
}) {
  const active = categories.find((category) => category.id === value);
  const expandedDivision = active && (isDivision(active) ? active : parentOf(categories, active));
  const divisions = categories.filter(isDivision);
  const guideCount = (categoryId: string) =>
    guides.filter((guide) => lessonBelongsToCategory(guide.categoryId, categoryId, categories))
      .length;

  return (
    <section aria-label="Browse disciplines" className="mb-10">
      <h2 className="mb-5 text-2xl font-semibold text-foreground">Browse by discipline</h2>
      <Accordion.Root
        type="single"
        collapsible
        value={expandedDivision?.id ?? ""}
        onValueChange={onChange}
        className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {divisions.map((division, index) => {
          const sections = childrenOf(categories, division.id);
          const count = guideCount(division.id);
          return (
            <Accordion.Item
              key={division.id}
              value={division.id}
              className="contents"
              style={
                {
                  "--card-order": index * 2,
                  "--panel-order": index * 2 + 1,
                  "--panel-order-sm": Math.floor(index / 2) * 4 + 3,
                  "--panel-order-xl": Math.floor(index / 3) * 6 + 5,
                } as CSSProperties
              }
            >
              <Accordion.Header className="order-[var(--card-order)] flex h-full">
                <Accordion.Trigger className="group relative flex min-h-48 w-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/70 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:border-primary data-[state=open]:bg-primary/10">
                  <span className="mb-5 flex w-full items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Layers className="h-6 w-6" aria-hidden="true" />
                    </span>
                    {division.code && (
                      <span className="text-base font-medium text-muted-foreground">
                        Division {division.code}
                      </span>
                    )}
                  </span>
                  <span className="text-2xl font-semibold leading-snug text-foreground">
                    {division.name}
                  </span>
                  <span className="mt-4 flex w-full items-center justify-between gap-3 text-base text-muted-foreground">
                    <span>
                      {count} guide{count === 1 ? "" : "s"}
                    </span>
                    <ChevronDown
                      className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="col-span-full order-[var(--panel-order)] overflow-hidden sm:order-[var(--panel-order-sm)] xl:order-[var(--panel-order-xl)] motion-safe:data-[state=open]:animate-[guide-sections-down_220ms_ease-out] motion-safe:data-[state=closed]:animate-[guide-sections-up_180ms_ease-in]">
                <div className="rounded-xl border border-primary/30 bg-surface/60 p-5 sm:p-6">
                  <h3 className="mb-4 text-xl font-semibold text-foreground">
                    {division.name} sections
                  </h3>
                  {sections.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {sections.map((section) => {
                        const selected = section.id === value;
                        const count = guideCount(section.id);
                        return (
                          <button
                            key={section.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(selected ? division.id : section.id)}
                            className={`rounded-xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/70"}`}
                          >
                            <span className="mb-3 flex items-center gap-3 text-base text-muted-foreground">
                              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                              {section.code || "Section"}
                            </span>
                            <span className="block text-xl font-semibold leading-snug text-foreground">
                              {section.name}
                            </span>
                            <span className="mt-3 block text-base text-muted-foreground">
                              {count} guide{count === 1 ? "" : "s"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      No subsections in this discipline. Its guides are shown below.
                    </p>
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </section>
  );
}
