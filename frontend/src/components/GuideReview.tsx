import { useEffect, useRef, useState } from "react";
import { markGuideReviewed, recordGuideView } from "@/api/progress";
import { Button } from "@/components/ui/button";

export function GuideReview({ guideId }: { guideId: string }) {
  const request = useRef<ReturnType<typeof recordGuideView> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "reviewed" | "unavailable">("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    request.current ??= recordGuideView(guideId);
    request.current.then(
      ({ progress }) => {
        if (current) setStatus(progress.completedAt ? "reviewed" : "ready");
      },
      () => {
        if (current) setStatus("unavailable");
      },
    );
    return () => {
      current = false;
    };
  }, [guideId]);

  async function reviewGuide() {
    setSaving(true);
    setError("");
    try {
      await markGuideReviewed(guideId);
      setStatus("reviewed");
    } catch {
      setError("Could not save your review. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 space-y-2 rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold">Learning progress</h2>
      <p className="text-sm text-muted-foreground">
        Mark the guide once you’ve reviewed it. Your self-reported review is visible to
        administrators.
      </p>
      {status === "ready" && (
        <Button type="button" onClick={reviewGuide} disabled={saving}>
          {saving ? "Saving…" : "Mark as reviewed"}
        </Button>
      )}
      {status === "reviewed" && (
        <p role="status" className="font-medium">
          Reviewed
        </p>
      )}
      {status === "loading" && <p role="status">Loading learning progress…</p>}
      {status === "unavailable" && (
        <p role="status">Learning progress is unavailable. Refresh to retry.</p>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
