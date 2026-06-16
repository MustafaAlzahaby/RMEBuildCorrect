import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import type { Lesson } from "@/types";
import { formatDate, truncateText } from "@/utils";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const thumb = lesson.images[0]?.url;
  return (
    <Link
      to={`/lessons/${lesson.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/60 hover:shadow-elevated"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-elevated">
        {thumb ? (
          <img
            src={thumb}
            alt={lesson.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <PlayCircle className="absolute bottom-3 right-3 h-9 w-9 text-primary-foreground/90 drop-shadow" />
        <span className="absolute left-3 top-3 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {lesson.categoryName}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-foreground line-clamp-2">{lesson.title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{truncateText(lesson.description, 100)}</p>
        <span className="mt-3 text-xs text-muted-foreground">{formatDate(lesson.createdAt)}</span>
      </div>
    </Link>
  );
}
