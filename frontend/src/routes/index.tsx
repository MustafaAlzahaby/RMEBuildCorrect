import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { LessonCard } from "@/components/LessonCard";
import { listCategories } from "@/api/categories";
import { recentLessons } from "@/api/lessons";
import type { Category, Lesson } from "@/types";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recents, setRecents] = useState<Lesson[]>([]);

  useEffect(() => {
    listCategories().then(setCategories);
    recentLessons(4).then(setRecents);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.58 0.22 27 / 0.4), transparent 40%)" }} />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Internal Engineering Academy
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-6xl">
              Build it right.<br />
              <span className="text-primary">Every single time.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Method statements, video walkthroughs, and field-tested best practices —
              one platform for every Rowad engineer, on every site.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary-gradient text-primary-foreground shadow-red-glow hover:opacity-95">
                <Link to="/library">
                  Browse Library <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: "Lessons", value: "120+", icon: BookOpen },
              { label: "Categories", value: "6", icon: ShieldCheck },
              { label: "Engineers", value: "850", icon: Trophy },
              { label: "Languages", value: "EN/AR", icon: BookOpen },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface/60 p-4 backdrop-blur">
                <s.icon className="h-5 w-5 text-primary" />
                <div className="mt-2 font-display text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
              Featured Categories
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Browse by trade and discipline.</p>
          </div>
          <Link to="/library" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Recently added */}
      <section className="border-t border-border bg-sidebar/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                Recently Added Lessons
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Fresh content from the field.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recents.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
