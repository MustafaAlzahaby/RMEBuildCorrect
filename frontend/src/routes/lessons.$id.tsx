import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronRight, FileText, Image as ImageIcon, ListChecks, PlayCircle, ScrollText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLesson } from "@/api/lessons";
import { recordGuideView } from "@/api/progress";
import { useAuth } from "@/context/AuthContext";
import type { Lesson } from "@/types";

export function LessonPage() {
  const { id = "" } = useParams();
  const { isAuthenticated, user } = useAuth();
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
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading guide…</div>;
  }
  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl uppercase tracking-wide">Guide not found</h1>
        <Link to="/library" className="mt-4 inline-block text-primary hover:underline">← Back to library</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="hover:text-foreground">
          {isAuthenticated ? "My Guide" : "Home"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/library" className="hover:text-foreground">Library</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/library?category=${encodeURIComponent(lesson.categoryId)}`} className="hover:text-foreground">
          {lesson.categoryName}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{lesson.title}</span>
      </nav>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <span className="inline-block rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
            {lesson.categoryName}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{lesson.description}</p>
        </div>
      </div>

      <Tabs defaultValue="video" className="mt-8">
        <TabsList className="flex w-full flex-wrap gap-1 bg-surface">
          <TabsTrigger value="video"><PlayCircle className="mr-1.5 h-4 w-4" /> Video</TabsTrigger>
          <TabsTrigger value="images"><ImageIcon className="mr-1.5 h-4 w-4" /> Gallery</TabsTrigger>
          <TabsTrigger value="pdf"><FileText className="mr-1.5 h-4 w-4" /> PDF</TabsTrigger>
          <TabsTrigger value="instructions"><ScrollText className="mr-1.5 h-4 w-4" /> Instructions</TabsTrigger>
          <TabsTrigger value="best"><ListChecks className="mr-1.5 h-4 w-4" /> Best Practices</TabsTrigger>
          <TabsTrigger value="method"><FileText className="mr-1.5 h-4 w-4" /> Method Statement</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            {lesson.videoUrl ? (
              <video controls className="aspect-video w-full" src={lesson.videoUrl} poster={lesson.images[0]?.url} />
            ) : (
              <div className="p-10 text-center text-muted-foreground">No video provided.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lesson.images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <img src={img.url} alt={img.caption ?? lesson.title} className="aspect-video w-full object-cover" />
                {img.caption && <figcaption className="p-3 text-sm text-muted-foreground">{img.caption}</figcaption>}
              </figure>
            ))}
            {lesson.images.length === 0 && <p className="text-muted-foreground">No images.</p>}
          </div>
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          {lesson.pdfUrl ? (
            <iframe src={lesson.pdfUrl} title="Guide PDF" className="h-[75vh] w-full rounded-lg border border-border bg-card" />
          ) : (
            <p className="text-muted-foreground">No PDF attached.</p>
          )}
        </TabsContent>

        <TabsContent value="instructions" className="mt-4">
          <article className="prose prose-invert max-w-none rounded-lg border border-border bg-card p-6 text-foreground/90 whitespace-pre-line">
            {lesson.instructions}
          </article>
        </TabsContent>

        <TabsContent value="best" className="mt-4">
          <article className="rounded-lg border border-border bg-card p-6 text-foreground/90 whitespace-pre-line">
            {lesson.bestPractices}
          </article>
        </TabsContent>

        <TabsContent value="method" className="mt-4">
          <article className="rounded-lg border border-border bg-card p-6 text-foreground/90 whitespace-pre-line">
            {lesson.methodStatement}
          </article>
        </TabsContent>
      </Tabs>
    </div>
  );
}
