import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import type { Lesson } from "@/types";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const thumbnail = lesson.images[0]?.url;
  return (
    <Link
      to={`/lessons/${lesson.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-elevated">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-hero">
            <BookOpen className="h-16 w-16 text-foreground/50" aria-hidden="true" />
          </div>
        )}
        {lesson.videoUrl && (
          <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-sm font-medium text-foreground">
            <PlayCircle className="h-5 w-5" aria-hidden="true" /> Video
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 text-sm font-medium leading-6 text-muted-foreground">
          {lesson.categoryName}
        </p>
        <h3 className="text-2xl font-semibold leading-snug text-foreground">{lesson.title}</h3>
        {lesson.description && (
          <p className="mt-3 line-clamp-3 text-base leading-7 text-foreground/80">
            {lesson.description}
          </p>
        )}
        <span className="mt-auto flex items-center justify-between gap-3 pt-6 text-base font-semibold text-foreground">
          Open guide <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
