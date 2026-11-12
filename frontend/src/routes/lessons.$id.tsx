import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { getLesson } from "@/api/lessons";
import { recordGuideView } from "@/api/progress";
import { useAuth } from "@/context/AuthContext";
import type { Lesson } from "@/types";

export function LessonPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const [lessonResult, setLessonResult] = useState<{
    id: string;
    lesson: Lesson | null;
  } | null>(null);
  const lesson = lessonResult?.id === id ? lessonResult.lesson : null;
  const loading = lessonResult?.id !== id;

  useEffect(() => {
    let ignore = false;

    getLesson(id).then((l) => {
      if (!ignore) setLessonResult({ id, lesson: l });
    });

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (user && lesson?.id === id) {
      recordGuideView(id).catch(() => undefined);
    }
  }, [user, lesson, id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading guide…
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide">Guide not found</h1>
        <Link to="/library" className="mt-4 inline-block text-primary hover:underline">
          ← Back to library
        </Link>
      </div>
    );
  }

  const mainText = lesson.instructions.trim() ? lesson.instructions : lesson.methodStatement;
  return (
    <div key={lesson.id} className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10">
      <Link
        to="/library"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to guides
      </Link>
      <header className="mb-7 mt-3">
        <Link
          to={`/library?category=${encodeURIComponent(lesson.categoryId)}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {lesson.categoryName}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            {lesson.description}
          </p>
        )}
      </header>

      {mainText.trim() && (
        <section className="mb-6 rounded-xl border border-border bg-card p-5 sm:p-7">
          <h2 className="mb-4 text-xl font-semibold">
            {lesson.instructions.trim() ? "How to do it" : "Method statement"}
          </h2>
          <GuideText>{mainText}</GuideText>
        </section>
      )}

      <div className="space-y-3">
        {lesson.bestPractices.trim() && (
          <GuideDetail title="Best practices" defaultOpen={!mainText.trim()}>
            <GuideText>{lesson.bestPractices}</GuideText>
          </GuideDetail>
        )}
        {lesson.itp.trim() && (
          <GuideDetail title="Inspection & test plan (ITP)">
            <GuideText>{lesson.itp}</GuideText>
          </GuideDetail>
        )}
        {lesson.videoUrl && (
          <GuideDetail
            title="Watch the video"
            defaultOpen={!mainText.trim() && !lesson.bestPractices.trim()}
          >
            <video
              controls
              preload="none"
              className="aspect-video max-h-[65vh] w-full rounded-lg bg-black"
              src={lesson.videoUrl}
              poster={lesson.images[0]?.url}
            />
          </GuideDetail>
        )}
        {lesson.images.length > 0 && (
          <GuideDetail title={`Reference photos (${lesson.images.length})`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {lesson.images.map((image) => (
                <figure key={image.id}>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={"Open photo: " + (image.caption || lesson.title)}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || lesson.title}
                      loading="lazy"
                      className="w-full rounded-lg"
                    />
                  </a>
                  {image.caption && (
                    <figcaption className="mt-2 text-sm leading-6 text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </GuideDetail>
        )}
        {lesson.instructions.trim() && lesson.methodStatement.trim() && (
          <GuideDetail title="Full method statement">
            <GuideText>{lesson.methodStatement}</GuideText>
          </GuideDetail>
        )}
        {lesson.pdfUrl && (
          <GuideDetail title="PDF document">
            <a
              href={lesson.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Open PDF
            </a>
            <iframe
              src={lesson.pdfUrl}
              title="Guide PDF"
              loading="lazy"
              className="mt-4 hidden h-[65vh] w-full rounded-lg border border-border sm:block"
            />
          </GuideDetail>
        )}
        {lesson.lessonLearnt.trim() && (
          <GuideDetail title="Lessons learned">
            <GuideText>{lesson.lessonLearnt}</GuideText>
          </GuideDetail>
        )}
      </div>
    </div>
  );
}

function GuideText({ children }: { children: string }) {
  return (
    <div className="whitespace-pre-line break-words text-base leading-8 text-foreground/90">
      {children}
    </div>
  );
}

function GuideDetail({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-xl border border-border bg-card"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      {open && <div className="border-t border-border px-5 py-5 sm:px-7">{children}</div>}
    </details>
  );
}
