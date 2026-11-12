import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const referencePdfs = Object.entries(
  import.meta.glob<string>("/src/data/concrete-footings/references/*.pdf", {
    eager: true,
    query: "?url&no-inline",
    import: "default",
  }),
).map(([path, url]) => {
  const filename = path.slice(path.lastIndexOf("/") + 1);
  return { filename, url, title: filename.replace(/\.pdf$/i, "") };
});

export function ConcreteFootingReferencesPage() {
  const [params, setParams] = useSearchParams();
  const pdf =
    referencePdfs.find(({ filename }) => filename === params.get("file")) ?? referencePdfs[0];

  return (
    <section className="container mx-auto max-w-6xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Reference PDFs</h1>
      <p className="text-muted-foreground">Plain Concrete (PC) Footings &amp; Raft</p>
      {pdf ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
              Document
              <select
                value={pdf.filename}
                onChange={(event) => setParams({ file: event.target.value })}
                className="min-h-10 rounded-md border border-input bg-background px-3"
              >
                {referencePdfs.map(({ filename, title }) => (
                  <option key={filename} value={filename}>
                    {title}
                  </option>
                ))}
              </select>
            </label>
            <Button asChild variant="outline">
              <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                Open PDF
              </a>
            </Button>
            <Button asChild>
              <a href={pdf.url} download={pdf.filename}>
                Download
              </a>
            </Button>
          </div>
          <iframe
            key={pdf.filename}
            src={pdf.url}
            title={pdf.title}
            className="h-[75vh] min-h-80 w-full rounded-md border border-border"
          />
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
          No reference PDFs have been added yet.
        </p>
      )}
    </section>
  );
}
