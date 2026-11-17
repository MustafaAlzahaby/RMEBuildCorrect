import { apiRequest } from "./client";

export type ActivityKind = "category" | "subcategory" | "workspace" | "tab" | "file" | "download";

type ActivityPage = {
  events: Array<{
    _id: string;
    kind: ActivityKind;
    title: string;
    context?: string;
    occurredAt: string;
  }>;
  counts: Partial<Record<ActivityKind, number>>;
  hasNext: boolean;
};

export function trackLibraryActivity(kind: ActivityKind, title: string, context?: string) {
  void apiRequest("/progress/library-activity", {
    method: "POST",
    body: JSON.stringify({ kind, title: title.slice(0, 300), context: context?.slice(0, 600) }),
    keepalive: true,
  }).catch(() => {
    // Activity recording must not interrupt navigation or file actions.
  });
}

export function getLibraryActivity(userId: string, page: number, kind: ActivityKind | "") {
  const query = new URLSearchParams({ page: String(page) });
  if (kind) query.set("kind", kind);
  return apiRequest<ActivityPage>(`/users/${userId}/library-activity?${query}`);
}

export const footingTitle = "Plain Concrete (PC) Footings & Raft";
export const footingContext = `Concrete / 03 30 00 / ${footingTitle}`;
