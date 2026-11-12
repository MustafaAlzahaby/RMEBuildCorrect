import { useEffect, useState, type FormEvent } from "react";
import {
  Check,
  FileText,
  Film,
  Image as ImageIcon,
  ListChecks,
  Plus,
  Save,
  Upload,
  X,
  LoaderCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AdminSectionSelect } from "./AdminSectionSelect";
import { categoryLabel, parentOf } from "@/lib/categories";
import type { Category, Lesson } from "@/types";
import type { LessonFormInput } from "@/api/lessons";

type TextKey = "instructions" | "methodStatement" | "itp" | "bestPractices" | "lessonLearnt";
type ContentKey = TextKey | "pdf" | "video" | "images";
const textBlocks: { key: TextKey; title: string; hint: string }[] = [
  {
    key: "instructions",
    title: "Instructions",
    hint: "Write the procedure in clear, numbered steps.",
  },
  {
    key: "methodStatement",
    title: "Method statement",
    hint: "Add the full work method, preparation, and execution requirements.",
  },
  {
    key: "itp",
    title: "Inspection & test plan",
    hint: "Include inspection stages, acceptance criteria, hold points, and records.",
  },
  {
    key: "bestPractices",
    title: "Best practices",
    hint: "Add practical checks and common mistakes to avoid.",
  },
  {
    key: "lessonLearnt",
    title: "Lessons learned",
    hint: "Capture experience that will help the next team.",
  },
];
const contentOptions = [
  ...textBlocks.map((block) => ({
    key: block.key as ContentKey,
    title: block.title,
    icon: ListChecks,
  })),
  { key: "pdf" as const, title: "PDF document", icon: FileText },
  { key: "video" as const, title: "Video", icon: Film },
  { key: "images" as const, title: "Photos", icon: ImageIcon },
];

export function AdminGuideEditor({
  initial,
  categories,
  presetSection,
  onSave,
  onCancel,
  onDirtyChange,
  onSavingChange,
}: {
  initial: Lesson | null;
  categories: Category[];
  presetSection: string;
  onSave: (data: LessonFormInput) => Promise<void>;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSavingChange: (saving: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    categoryId: initial?.categoryId ?? presetSection,
    description: initial?.description ?? "",
    instructions: initial?.instructions ?? "",
    methodStatement: initial?.methodStatement ?? "",
    itp: initial?.itp ?? "",
    bestPractices: initial?.bestPractices ?? "",
    lessonLearnt: initial?.lessonLearnt ?? "",
  });
  const [enabled, setEnabled] = useState<ContentKey[]>(() => [
    ...textBlocks.filter(({ key }) => initial?.[key]?.trim()).map(({ key }) => key),
    ...(initial?.pdfUrl ? ["pdf" as const] : []),
    ...(initial?.videoUrl ? ["video" as const] : []),
    ...(initial?.images.length ? ["images" as const] : []),
  ]);
  const [files, setFiles] = useState<{ pdf: File[]; video: File[]; images: File[] }>({
    pdf: [],
    video: [],
    images: [],
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const section = categories.find((item) => item.id === form.categoryId);
  const division = parentOf(categories, section);
  const contentCount =
    textBlocks.filter(({ key }) => form[key].trim()).length +
    Number(Boolean(files.pdf.length || initial?.pdfUrl)) +
    Number(Boolean(files.video.length || initial?.videoUrl)) +
    Number(Boolean(files.images.length || initial?.images.length));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function markDirty() {
    setDirty(true);
    onDirtyChange(true);
  }
  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    markDirty();
  }
  function addBlock(key: ContentKey) {
    setEnabled((current) => (current.includes(key) ? current : [...current, key]));
    window.setTimeout(
      () =>
        document
          .getElementById(`guide-block-${key}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      0,
    );
  }
  function removeText(key: TextKey) {
    if (
      form[key].trim() &&
      !window.confirm("Remove this content from the guide? This takes effect when you save.")
    )
      return;
    update(key, "");
    setEnabled((current) => current.filter((item) => item !== key));
  }
  function selectFiles(key: "pdf" | "video" | "images", selected: File[]) {
    setError("");
    const accepted =
      key === "pdf"
        ? (file: File) => file.type === "application/pdf" || /\.pdf$/i.test(file.name)
        : key === "video"
          ? (file: File) =>
              file.type.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(file.name)
          : (file: File) =>
              file.type.startsWith("image/") ||
              /\.(png|jpe?g|webp|gif|svg|heic|bmp|tiff?)$/i.test(file.name);
    if (selected.some((file) => !accepted(file))) {
      setError(
        `Choose ${key === "pdf" ? "PDF documents" : key === "video" ? "video files" : "image files"} for this block.`,
      );
      return;
    }
    if (selected.some((file) => file.size > 500 * 1024 * 1024)) {
      setError("Each file must be 500 MB or smaller.");
      return;
    }
    const next =
      key === "images"
        ? [...files.images, ...selected].filter(
            (file, index, all) =>
              all.findIndex(
                (other) =>
                  other.name === file.name &&
                  other.size === file.size &&
                  other.lastModified === file.lastModified,
              ) === index,
          )
        : selected.slice(0, 1);
    if (next.length > 20) {
      setError("Choose up to 20 photos per guide.");
      return;
    }
    setFiles((current) => ({ ...current, [key]: next }));
    markDirty();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (form.title.trim().length < 2) {
      setError("Give the guide a title of at least two characters.");
      document.getElementById("guide-title")?.focus();
      return;
    }
    if (!section) {
      setError("Choose the subsection where this guide belongs.");
      document.getElementById("guide-section")?.focus();
      return;
    }
    if (!contentCount) {
      setError(
        "Add at least one instruction, document, video, photo, or other content block before saving.",
      );
      return;
    }
    setSaving(true);
    onSavingChange(true);
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        videoUrl: initial?.videoUrl ?? "",
        pdfUrl: initial?.pdfUrl ?? "",
        images: initial?.images ?? [],
        pdfFile: files.pdf[0] ?? null,
        videoFile: files.video[0] ?? null,
        imageFiles: files.images,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the guide. Your changes are still here.",
      );
    } finally {
      setSaving(false);
      onSavingChange(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
        <fieldset
          disabled={saving}
          className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_260px] disabled:opacity-70"
        >
          <div className="min-w-0 space-y-7">
            <section className="space-y-5" aria-label="Guide details">
              <div>
                <h3 className="text-xl font-semibold">Guide details</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Choose where it belongs, then give it a clear name.
                </p>
              </div>
              <div>
                <Label htmlFor="guide-section">
                  Subsection <span className="text-primary">*</span>
                </Label>
                <div className="mt-2">
                  <AdminSectionSelect
                    id="guide-section"
                    categories={categories}
                    value={form.categoryId}
                    onChange={(value) => update("categoryId", value)}
                    legacyId={initial?.categoryId}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guide-title">
                  Guide title <span className="text-primary">*</span>
                </Label>
                <Input
                  id="guide-title"
                  required
                  minLength={2}
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="e.g. Concrete placement and inspection"
                  className="mt-2 h-12 bg-surface text-base"
                />
              </div>
              <div>
                <Label htmlFor="guide-description">
                  Short description{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="guide-description"
                  rows={2}
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="What will this guide help the engineer do?"
                  className="mt-2 bg-surface text-base"
                />
              </div>
            </section>
            <section aria-label="Choose content types">
              <h3 className="text-xl font-semibold">What would you like to add?</h3>
              <p className="mb-4 mt-1 text-sm leading-6 text-muted-foreground">
                Choose one or more. Only the content you add appears in the guide.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {contentOptions.map(({ key, title, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addBlock(key)}
                    className={`flex min-h-24 flex-col items-start justify-between gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${enabled.includes(key) ? "border-primary/60 bg-primary/10" : "border-border bg-surface hover:border-primary/60"}`}
                  >
                    <span className="flex w-full items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      {enabled.includes(key) ? (
                        <Check className="h-4 w-4" aria-label="Added" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </span>
                    {title}
                  </button>
                ))}
              </div>
            </section>
            {textBlocks
              .filter(({ key }) => enabled.includes(key))
              .map(({ key, title, hint }) => (
                <section
                  id={`guide-block-${key}`}
                  key={key}
                  className="scroll-mt-5 rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <Label htmlFor={`guide-${key}`} className="text-lg font-semibold">
                        {title}
                      </Label>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{hint}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeText(key)}
                      aria-label={`Remove ${title}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea
                    id={`guide-${key}`}
                    rows={7}
                    value={form[key]}
                    onChange={(event) => update(key, event.target.value)}
                    className="bg-surface text-base leading-7"
                  />
                </section>
              ))}
            {(["pdf", "video", "images"] as const)
              .filter((key) => enabled.includes(key))
              .map((key) => (
                <section
                  id={`guide-block-${key}`}
                  key={key}
                  className="scroll-mt-5 rounded-xl border border-border bg-card p-5"
                >
                  <h3 className="text-lg font-semibold">
                    {key === "pdf"
                      ? "PDF document"
                      : key === "video"
                        ? "Video"
                        : "Reference photos"}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {key === "pdf"
                      ? "Attach a method statement, inspection plan, or another supporting PDF."
                      : key === "video"
                        ? "Upload a video walkthrough for this guide."
                        : "Add up to 20 reference photos. The first photo becomes the guide cover."}
                  </p>
                  {key === "pdf" && initial?.pdfUrl && (
                    <ExistingFile href={initial.pdfUrl} label="View current PDF" />
                  )}
                  {key === "video" && initial?.videoUrl && (
                    <ExistingFile href={initial.videoUrl} label="View current video" />
                  )}
                  {key === "images" && Boolean(initial?.images.length) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {initial?.images.map((image, index) => (
                        <a
                          key={image.id}
                          href={image.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-border p-1"
                        >
                          <img
                            src={image.url}
                            alt={`Current photo ${index + 1}`}
                            className="h-16 w-20 rounded object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  {(
                    key === "pdf"
                      ? initial?.pdfUrl
                      : key === "video"
                        ? initial?.videoUrl
                        : initial?.images.length
                  ) ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Leave the upload empty to keep the current {key === "images" ? "photos" : key}
                      . New uploads replace the current {key === "images" ? "gallery" : "file"}.
                    </p>
                  ) : null}
                  <label className="mt-4 flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed border-border bg-surface p-5 hover:border-primary/60">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Upload className="h-5 w-5 text-primary" />
                      Choose {key === "images" ? "photos" : key === "pdf" ? "a PDF" : "a video"}
                    </span>
                    <input
                      type="file"
                      aria-label={`Upload ${key === "images" ? "photos" : key}`}
                      accept={
                        key === "pdf"
                          ? "application/pdf,.pdf"
                          : key === "video"
                            ? "video/*"
                            : "image/*"
                      }
                      multiple={key === "images"}
                      onChange={(event) => {
                        selectFiles(key, Array.from(event.target.files ?? []));
                        event.currentTarget.value = "";
                      }}
                      className="w-full min-w-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-3 file:py-2 file:text-foreground"
                    />
                    <span className="text-xs text-muted-foreground">
                      Maximum 500 MB per file{key === "images" ? " · Up to 20 photos" : ""}
                    </span>
                  </label>
                  {files[key].map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="mt-3 flex min-w-0 items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="min-w-0 flex-1 break-all">{file.name}</span>
                      <span className="shrink-0 text-muted-foreground">{fileSize(file.size)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-accent"
                        onClick={() => {
                          setFiles((current) => ({
                            ...current,
                            [key]: current[key].filter((_, i) => i !== index),
                          }));
                          markDirty();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </section>
              ))}
          </div>
          <aside className="self-start rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-0">
            <h3 className="text-lg font-semibold">Guide summary</h3>
            <p className="mt-4 break-words text-lg font-medium">{form.title || "Untitled guide"}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {division?.name}
              {division ? " / " : ""}
              {section ? categoryLabel(section) : "Choose a subsection"}
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>{form.categoryId ? "✓" : "○"} Subsection selected</li>
              <li>{form.title.trim().length >= 2 ? "✓" : "○"} Title added</li>
              <li>
                {contentCount ? "✓" : "○"} {contentCount} content block
                {contentCount === 1 ? "" : "s"}
              </li>
            </ul>
            <p className="mt-5 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
              {initial
                ? "Saving updates the live guide."
                : "Saving makes this guide available to signed-in engineers."}
            </p>
          </aside>
        </fieldset>
      </div>
      <div className="shrink-0 border-t border-border bg-background px-5 py-4 sm:px-7">
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-muted-foreground">
            {saving
              ? "Uploading and saving… Please keep this window open."
              : dirty
                ? "Unsaved changes"
                : "Add the content your team needs."}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="min-h-11 gap-2">
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : initial ? "Save changes" : "Save guide"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
function ExistingFile({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
    >
      <FileText className="h-4 w-4" />
      {label}
    </a>
  );
}
function fileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
