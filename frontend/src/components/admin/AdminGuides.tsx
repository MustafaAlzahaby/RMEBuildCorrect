import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminGuideEditor } from "./AdminGuideEditor";
import { AdminSectionSelect } from "./AdminSectionSelect";
import {
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  type LessonFormInput,
} from "@/api/lessons";
import { listCategories } from "@/api/categories";
import { matchesGuideQuery } from "@/lib/guide-search";
import type { Category, Lesson } from "@/types";

export function AdminGuides() {
  const [guides, setGuides] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("");
  const [editor, setEditor] = useState<{ lesson: Lesson | null; preset: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError("");
    try {
      const [nextGuides, nextCategories] = await Promise.all([listLessons(), listCategories()]);
      setGuides(nextGuides);
      setCategories(nextCategories);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load the content library.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const filtered = useMemo(
    () =>
      guides.filter(
        (guide) =>
          (!section || guide.categoryId === section) && matchesGuideQuery(guide, query, categories),
      ),
    [guides, section, query, categories],
  );
  const hasSections = categories.some((category) => category.parentId);

  function openEditor(lesson: Lesson | null) {
    setDirty(false);
    setEditor({ lesson, preset: section });
  }
  function closeEditor() {
    if (saving) return;
    if (dirty && !window.confirm("Discard your unsaved guide changes?")) return;
    setEditor(null);
    setDirty(false);
  }
  async function save(data: LessonFormInput) {
    if (editor?.lesson) await updateLesson(editor.lesson.id, data);
    else await createLesson(data);
    toast.success(editor?.lesson ? "Guide updated" : "Guide added to the subsection");
    setDirty(false);
    setEditor(null);
    void refresh();
  }
  async function remove(guide: Lesson) {
    if (!window.confirm(`Delete "${guide.title}"? This also removes its viewing history.`)) return;
    setDeleting(guide.id);
    try {
      await deleteLesson(guide.id);
      toast.success("Guide deleted");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the guide");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Guide library</h2>
          <p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">
            Add instructions, documents, and media to a subsection. Keep everything for a task
            together in one guide.
          </p>
        </div>
        <Button
          onClick={() => openEditor(null)}
          disabled={loading || !hasSections || Boolean(loadError)}
          className="min-h-12 gap-2 px-5"
        >
          <Plus className="h-5 w-5" /> Add guide
        </Button>
      </div>
      {!loading && !loadError && !hasSections && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-base leading-7">
          Create a subsection under a division in Categories first, then add its guides here.
        </div>
      )}
      <div className="rounded-xl border border-border bg-card">
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)] sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search admin guides"
              placeholder="Search guides or section codes…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 bg-surface pl-11 text-base"
            />
          </div>
          <AdminSectionSelect
            categories={categories}
            value={section}
            onChange={setSection}
            all
            disabled={loading}
          />
        </div>
        {loading ? (
          <p role="status" className="flex items-center gap-3 p-7 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading your library…
          </p>
        ) : loadError ? (
          <div role="alert" className="p-6">
            <p>{loadError}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setLoading(true);
                void refresh();
              }}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <p role="status" className="px-5 pb-1 pt-4 text-sm text-muted-foreground">
              {filtered.length} guide{filtered.length === 1 ? "" : "s"}
              {section ? " in this subsection" : ""}
            </p>
            <div className="divide-y divide-border">
              {filtered.map((guide) => (
                <article
                  key={guide.id}
                  className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="min-w-0">
                    <p className="mb-1 text-sm text-muted-foreground">{guide.categoryName}</p>
                    <h3 className="text-lg font-semibold leading-7">{guide.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {guideContent(guide).map((label) => (
                        <span
                          key={label}
                          className="rounded-md bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground/80"
                        >
                          {label}
                        </span>
                      ))}
                      {guideContent(guide).length === 0 && (
                        <span className="text-sm text-muted-foreground">No content added yet</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openEditor(guide)}
                      className="min-h-11 gap-2"
                    >
                      <Pencil className="h-4 w-4" /> Edit guide
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="h-11 w-11">
                      <Link
                        to={`/lessons/${guide.id}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${guide.title}`}
                        title="View guide"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-destructive"
                      disabled={Boolean(deleting)}
                      onClick={() => void remove(guide)}
                      aria-label={`Delete ${guide.title}`}
                      title="Delete guide"
                    >
                      {deleting === guide.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-9 w-9 text-muted-foreground" />
                <h3 className="text-xl font-semibold">
                  {query || section
                    ? "No guides match these filters"
                    : "Your first guide starts here"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-base leading-7 text-muted-foreground">
                  {query || section
                    ? "Try another search, or add a guide to this subsection."
                    : "Choose a subsection, give the guide a name, and add the content your site team needs."}
                </p>
                {(query || section) && (
                  <Button
                    className="mt-5"
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setSection("");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <DialogContent
          className="flex h-[94dvh] w-[calc(100vw_-_1rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-6xl"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => {
            if (saving) event.preventDefault();
          }}
        >
          <DialogHeader className="shrink-0 border-b border-border px-5 py-5 pr-12 text-left sm:px-7">
            <DialogTitle className="text-2xl">
              {editor?.lesson ? "Edit guide" : "Add a guide"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              Choose a subsection and add only the content this guide needs.
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <AdminGuideEditor
              key={editor.lesson?.id ?? "new"}
              initial={editor.lesson}
              presetSection={editor.preset}
              categories={categories}
              onSave={save}
              onCancel={closeEditor}
              onDirtyChange={setDirty}
              onSavingChange={setSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function guideContent(guide: Lesson) {
  return [
    guide.instructions.trim() && "Instructions",
    guide.methodStatement.trim() && "Method statement",
    guide.itp.trim() && "ITP",
    guide.bestPractices.trim() && "Best practices",
    guide.lessonLearnt.trim() && "Lessons learned",
    guide.pdfUrl && "PDF",
    guide.videoUrl && "Video",
    guide.images.length > 0 && `${guide.images.length} photos`,
  ].filter(Boolean) as string[];
}
