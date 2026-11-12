import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import { BookOpen, ChevronDown, ExternalLink, FileText, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import general from "@/data/concrete-footings/general.txt?raw";
import procurement from "@/data/concrete-footings/procurement.txt?raw";
import method from "@/data/concrete-footings/method.txt?raw";
import inspection from "@/data/concrete-footings/inspection.txt?raw";
import start from "@/data/concrete-footings/start.txt?raw";
import execution from "@/data/concrete-footings/execution.txt?raw";
import type { Category, Lesson } from "@/types";
import { childrenOf, isDivision, lessonBelongsToCategory, parentOf } from "@/lib/categories";

const footingTabs: { title: string; content: string; reference?: string }[] = [
  { title: "GENERAL REQUIREMENTS", content: general },
  { title: "MATERIAL PROCUREMENT & DELIVERY (MIRs)", content: procurement },
  { title: "METHOD STATEMENT REQUIREMENTS", content: method },
  { title: "INSPECTION & TEST PLAN (ITP)", content: inspection, reference: "ITP.pdf" },
  { title: "START NEW ACTIVITY REQUIREMENTS", content: start },
  { title: "EXECUTION FULL GUID", content: execution },
];

function isolateEnglishParentheses(text: string) {
  return text.replace(/\([A-Za-z0-9][A-Za-z0-9\s/&,+.-]*\)/g, "\u2066$&\u2069");
}

const executionPhotos = import.meta.glob<string>("@/data/concrete-footings/photos/*.jpeg", {
  eager: true,
  query: "?url",
  import: "default",
});

const executionGalleries: Record<string, { images: number[]; caption: string }[]> = {
  "6.1": [{ images: [1, 2], caption: "الفحص البصري للتربة والتأكد من جودة الدمك" }],
  "6.2": [
    { images: [5, 6], caption: "تجهيز وتركيب الشدة وتقويتها وتسليمها ثم بدء الصب" },
    { images: [7], caption: "نموذج لتقوية نجارة القواعد" },
  ],
  "6.3": [{ images: [3, 4], caption: "تثبيت مشمع البولي ايثيلين" }],
  "8.3": [
    {
      images: [8, 9, 10],
      caption:
        "الاختبارات الخاصة بالخرسانة الموردة للموقع (slump test & Temperature) وأخذ المكعبات المطلوبة للعنصر",
    },
  ],
};

function ExecutionPhotos({ section }: { section: string }) {
  return executionGalleries[section].map(({ images, caption }) => (
    <figure key={caption} dir="rtl" lang="ar" className="rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image) => {
          const src = executionPhotos[`/src/data/concrete-footings/photos/image${image}.jpeg`];
          return (
            <a
              key={image}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:odd:last:col-span-2 sm:odd:last:w-[calc(50%-0.375rem)] sm:odd:last:justify-self-center"
            >
              <img
                src={src}
                alt={caption}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-md bg-muted object-contain"
              />
            </a>
          );
        })}
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {isolateEnglishParentheses(caption)}
      </figcaption>
    </figure>
  ));
}

function FootingTabContent({ content }: { content: string }) {
  const isExecution = content === execution;
  const lines = content.trim().split(/\r?\n/);
  const blocks: string[][] = [];

  let section = "";

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line) continue;

    const heading = isExecution && line.match(/^(\d+\.\d+)\s/);
    if (heading) {
      if (executionGalleries[section]) blocks.push(["", section]);
      section = heading[1];
    }

    if (line.startsWith("\u2022") && blocks.at(-1)?.[0].startsWith("\u2022")) {
      blocks.at(-1)?.push(line);
    } else if (
      isExecution &&
      blocks.length &&
      !/^(?:\u2022|\d+\.\d+|\(Execution Procedure)/.test(line)
    ) {
      const block = blocks[blocks.length - 1];
      block[block.length - 1] += " " + line;
    } else {
      blocks.push([line]);
    }
  }

  if (executionGalleries[section]) blocks.push(["", section]);

  return (
    <div className="mx-auto max-w-4xl space-y-4 text-start text-base leading-relaxed [font-family:Arial,sans-serif]">
      {blocks.map((block, index) => {
        const line = block[0];
        if (!line) return <ExecutionPhotos key={block[1]} section={block[1]} />;
        const arabic = /\p{Script=Arabic}/u.test(line);
        const language = arabic ? { dir: "rtl", lang: "ar" } : { dir: "ltr", lang: "en" };

        const reference = line.match(/^(Reference: ECP\d+\/\d+ - )(.+)$/);
        if (reference) {
          return (
            <p key={index} dir="ltr" lang="en" className="italic underline">
              {reference[1]}
              <bdi dir="rtl" lang="ar">
                {reference[2].split(/(\d+(?:-\d+)+)/).map((part, index) =>
                  index % 2 ? (
                    <bdi key={index} dir="ltr">
                      {part}
                    </bdi>
                  ) : (
                    part
                  ),
                )}
              </bdi>
            </p>
          );
        }

        if (line.startsWith("\u2022")) {
          return (
            <ul key={index} {...language} className="list-disc space-y-2 ps-6">
              {block.map((item, itemIndex) => (
                <li key={itemIndex}>{isolateEnglishParentheses(item.slice(1).trim())}</li>
              ))}
            </ul>
          );
        }

        if (isExecution && /^(?:\d+\.\d+\s|\(Execution Procedure)/.test(line)) {
          return (
            <h4
              key={index}
              {...language}
              className="pt-3 text-lg font-semibold [font-family:inherit]"
            >
              {isolateEnglishParentheses(line)}
            </h4>
          );
        }

        const label =
          !arabic && line.match(/^((?:\d+(?:\.\d+)*\.?\s+[^:]+|Important|Frequency):)(.*)$/);
        return (
          <p key={index} {...language}>
            {label ? (
              <>
                <strong>{label[1]}</strong>
                {label[2]}
              </>
            ) : (
              isolateEnglishParentheses(line)
            )}
          </p>
        );
      })}
    </div>
  );
}

const panelMotion =
  "overflow-hidden motion-safe:data-[state=open]:animate-[guide-sections-down_220ms_ease-out] motion-safe:data-[state=closed]:animate-[guide-sections-up_180ms_ease-in]";

function FootingReferences({ reference }: { reference?: string }) {
  return (
    <Link
      to={{
        pathname: "/library/concrete-footings/references",
        search: reference ? new URLSearchParams({ file: reference }).toString() : "",
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Review references (opens in a new tab)"
      className="mb-4 ms-auto -me-4 flex w-fit items-center gap-2 rounded-s-lg border-y border-s border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:-me-6"
    >
      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
      Review references
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

function ConcreteFootings() {
  const title = "Plain Concrete (PC) Footings & Raft";

  return (
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value="plain-concrete-footings-raft">
        <Accordion.Header>
          <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 text-left font-semibold transition-colors hover:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:border-primary/60">
            {title}
            <ChevronDown
              className="h-4 w-4 shrink-0 text-primary motion-safe:transition-transform group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={panelMotion}>
          <Tabs defaultValue={footingTabs[0].title} className="pt-4">
            <TabsList aria-label={title} className="flex h-auto flex-wrap justify-start gap-1">
              {footingTabs.map(({ title: tab }) => (
                <TabsTrigger key={tab} value={tab} className="whitespace-normal text-left text-xs">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {footingTabs.map(({ title: tab, content, reference }) => (
              <TabsContent
                key={tab}
                value={tab}
                className="rounded-lg border border-border bg-card px-4 py-5 text-foreground sm:px-6"
              >
                <FootingReferences reference={reference} />
                <FootingTabContent content={content} />
              </TabsContent>
            ))}
          </Tabs>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

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
                    <Accordion.Root
                      type="single"
                      collapsible
                      value={sections.some((section) => section.id === value) ? value : ""}
                      onValueChange={(sectionId) => onChange(sectionId || division.id)}
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      {sections.map((section, index) => {
                        const selected = section.id === value;
                        const count = guideCount(section.id);
                        const hasSubsections =
                          division.code === "03" && section.code === "03 30 00";
                        const cardOrder = { order: index * 2 };
                        const cardClass = `w-full rounded-xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/70"}`;
                        const card = (
                          <>
                            <span className="mb-3 flex items-center gap-3 text-base text-muted-foreground">
                              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                              {section.code || "Section"}
                              {hasSubsections && (
                                <ChevronDown
                                  className="ml-auto h-4 w-4 text-primary motion-safe:transition-transform group-data-[state=open]:rotate-180"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                            <span className="block text-xl font-semibold leading-snug text-foreground">
                              {section.name}
                            </span>
                            <span className="mt-3 block text-base text-muted-foreground">
                              {count} guide{count === 1 ? "" : "s"}
                            </span>
                          </>
                        );

                        return hasSubsections ? (
                          <Accordion.Item key={section.id} value={section.id} className="contents">
                            <Accordion.Header className="flex" style={cardOrder}>
                              <Accordion.Trigger className={`group ${cardClass}`}>
                                {card}
                              </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content
                              className={`col-span-full order-[var(--section-panel-order)] sm:order-[var(--section-panel-order-sm)] xl:order-[var(--section-panel-order-xl)] ${panelMotion}`}
                              style={
                                {
                                  "--section-panel-order": index * 2 + 1,
                                  "--section-panel-order-sm": Math.floor(index / 2) * 4 + 3,
                                  "--section-panel-order-xl": Math.floor(index / 3) * 6 + 5,
                                } as CSSProperties
                              }
                            >
                              <div className="rounded-xl border border-primary/25 bg-surface-elevated p-4">
                                <ConcreteFootings />
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                        ) : (
                          <button
                            key={section.id}
                            type="button"
                            style={cardOrder}
                            aria-pressed={selected}
                            onClick={() => onChange(selected ? division.id : section.id)}
                            className={cardClass}
                          >
                            {card}
                          </button>
                        );
                      })}
                    </Accordion.Root>
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
