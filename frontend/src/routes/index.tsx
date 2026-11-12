import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Search, BookOpen, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">Loading…</div>
    );
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <section className="home-hero relative overflow-hidden border-b border-border">
        <div className="home-hero-image absolute inset-0 hidden dark:block" aria-hidden="true" />
        <div className="absolute inset-0 hidden bg-background/90 dark:block" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-24">
          <p className="text-sm font-medium text-primary">Rowad Field Guide</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            The right guidance.
            <br />
            Right when you need it.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-foreground/80">
            Find the procedure, check the details, and get back to the job.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button
              asChild
              size="lg"
              className="min-h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/login">
                Sign in to your guides <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link
              to="/register"
              className="inline-flex min-h-11 items-center text-sm text-foreground/80 underline-offset-4 hover:underline"
            >
              Create a company account
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">For Rowad engineers and site teams.</p>
        </div>
      </section>
      <section
        aria-label="How it works"
        className="mx-auto grid max-w-4xl gap-7 px-4 py-10 sm:grid-cols-3 sm:py-12"
      >
        {[
          {
            icon: Search,
            title: "Find your task",
            text: "Search by name, discipline, or section code.",
          },
          {
            icon: BookOpen,
            title: "Get the steps",
            text: "Open practical instructions straight away.",
          },
          {
            icon: ClipboardCheck,
            title: "Check the detail",
            text: "Keep methods, inspections, photos, and documents close.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
