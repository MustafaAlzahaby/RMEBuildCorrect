import { useEffect, useRef, useState } from "react";
import { footingContext, footingTitle, trackLibraryActivity } from "@/api/libraryActivity";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuantityCalculator } from "@/components/QuantityCalculator";
import { ExecutionPhotos, FootingPhotoGallery } from "@/components/GuideCategoryBrowser";
import general from "@/data/concrete-footings/general.txt?raw";
import procurement from "@/data/concrete-footings/procurement.txt?raw";
import method from "@/data/concrete-footings/method.txt?raw";
import inspection from "@/data/concrete-footings/inspection.txt?raw";
import start from "@/data/concrete-footings/start.txt?raw";
import execution from "@/data/concrete-footings/execution.txt?raw";
import cover from "@/data/concrete-footings/photos/image5.jpeg";

const tabs = [
  "Overview",
  "Before You Start",
  "Execution Guide",
  "Quality & Inspection",
  "Method Statement",
  "QS & Measurement",
  "Reference Library",
  "Lessons Learned",
];
const matches = [...execution.matchAll(/^([6-8]\.\d+|(?:9|10|11|12|13)\.0) [^\r\n]+/gm)];
const steps = matches.map((heading, index) => ({
  id: heading[1],
  title: heading[0],
  text: execution.slice(heading.index, matches[index + 1]?.index),
}));
const checks = [
  ...general.split(/\r?\n/).filter((line) => /^1\.[1-3] /.test(line)),
  ...start.split(/\r?\n/).filter((line) => /^5\.[1-6] /.test(line)),
];
const lessonsLearned = steps.find(({ id }) => id === "13.0");
const photoSections = ["6.1", "6.2", "6.3", "8.3"];

function SourceText({ children }: { children: string }) {
  return (
    <div className="whitespace-pre-wrap text-start leading-8 [overflow-wrap:anywhere] [unicode-bidi:plaintext]">
      {children}
    </div>
  );
}

function PreparationChecklist({
  reviewed,
  onReview,
}: {
  reviewed: string[];
  onReview: (line: string, checked: boolean) => void;
}) {
  return (
    <section className="my-6 space-y-3 rounded-lg border p-4 sm:p-6">
      <h2 className="text-xl font-semibold">Optional preparation checklist</h2>
      <p className="text-sm text-muted-foreground">
        Review marks are temporary and record your review only. Follow the applicable inspection and
        authorization procedures.
      </p>
      <p role="status">
        {reviewed.length} of {checks.length} preparation checks completed
      </p>
      {checks.map((line) => (
        <label key={line} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <input
            type="checkbox"
            className="mt-1 size-5 shrink-0 accent-primary"
            checked={reviewed.includes(line)}
            onChange={(event) => onReview(line, event.target.checked)}
          />
          <span>{line}</span>
        </label>
      ))}
    </section>
  );
}

export function ConcreteFootingWorkspace() {
  const [active, setActive] = useState(tabs[0]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    trackLibraryActivity("workspace", footingTitle, "Concrete / 03 30 00");
  }, []);

  function selectTab(tab: string) {
    setActive(tab);
    trackLibraryActivity("tab", tab, footingContext);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:underline">
          Engineering Workspace
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/library" className="hover:underline">
          Library
        </Link>
        <span aria-hidden="true">/</span>
        <span>Concrete · 03 30 00</span>
      </nav>
      <header className="grid overflow-hidden rounded-xl border bg-card md:grid-cols-[1fr_20rem]">
        <div className="space-y-3 p-6 sm:p-8">
          <p className="text-sm font-medium text-primary">Engineering activity pilot</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Plain Concrete (PC) Footings &amp; Raft
          </h1>
          <p className="text-muted-foreground">
            Technical guidance must be verified against the applicable approved project documents
            and specifications before site execution.
          </p>
        </div>
        <img
          src={cover}
          alt="Reference photo from the concrete footings guide"
          className="h-48 w-full object-cover md:h-full"
        />
      </header>
      <Tabs value={active} onValueChange={selectTab}>
        <TabsList
          aria-label="Engineering activity sections"
          className="flex h-auto flex-wrap justify-start gap-1"
        >
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="min-h-11 whitespace-normal text-start">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab, index) => (
          <TabsContent key={tab} value={tab} className="rounded-xl border bg-card p-4 sm:p-7">
            {index === 0 && (
              <>
                <button
                  className="mb-5 min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
                  onClick={() => selectTab(tabs[2])}
                >
                  Start Execution Guide
                </button>
                <h2 className="mb-3 text-xl font-semibold">GENERAL REQUIREMENTS</h2>
                <SourceText>{general}</SourceText>
              </>
            )}
            {index === 1 && (
              <>
                <h2 className="mb-3 text-xl font-semibold">START NEW ACTIVITY REQUIREMENTS</h2>
                <SourceText>{start}</SourceText>
                <PreparationChecklist
                  reviewed={reviewed}
                  onReview={(line, checked) =>
                    setReviewed((items) =>
                      checked ? [...items, line] : items.filter((item) => item !== line),
                    )
                  }
                />
                <h2 className="mb-3 text-xl font-semibold">
                  MATERIAL PROCUREMENT &amp; DELIVERY (MIRs)
                </h2>
                <SourceText>{procurement}</SourceText>
              </>
            )}
            {index === 2 && (
              <>
                <SourceText>{execution.slice(0, matches[0]?.index ?? execution.length)}</SourceText>
                <div className="space-y-2">
                  {steps.map(({ id, title, text }) => (
                    <details key={id} className="rounded-lg border">
                      <summary
                        dir="auto"
                        className="cursor-pointer px-4 py-3 font-medium hover:bg-muted"
                      >
                        {title}
                      </summary>
                      <div className="space-y-3 border-t p-4">
                        <SourceText>{text}</SourceText>
                        {photoSections.includes(id) && <ExecutionPhotos section={id} />}
                      </div>
                    </details>
                  ))}
                </div>
              </>
            )}
            {index === 3 && (
              <>
                <Link
                  className="mb-4 inline-flex min-h-11 items-center font-medium text-primary underline"
                  to="/library/concrete-footings/references?file=ITP.pdf"
                >
                  Open ITP PDF
                </Link>
                <SourceText>{inspection}</SourceText>
              </>
            )}
            {index === 4 && (
              <>
                <h2 className="mb-3 text-xl font-semibold">METHOD STATEMENT REQUIREMENTS</h2>
                <SourceText>{method}</SourceText>
              </>
            )}
            {index === 5 && <QuantityCalculator />}
            {index === 6 && (
              <>
                <Link
                  className="mb-4 inline-flex min-h-11 items-center font-medium text-primary underline"
                  to="/library/concrete-footings/references"
                >
                  Reference PDFs
                </Link>
                <FootingPhotoGallery />
              </>
            )}
            {index === 7 &&
              (lessonsLearned ? (
                <SourceText>{lessonsLearned.text}</SourceText>
              ) : (
                <p>Content under development</p>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
