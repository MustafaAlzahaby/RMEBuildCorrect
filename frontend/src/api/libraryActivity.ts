import type { MouseEvent } from "react";
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
  }).catch((error: unknown) => {
    console.warn("Library activity could not be recorded", kind, error);
  });
}

export function recordDivisionOpen(division: { name: string; code?: string }) {
  trackLibraryActivity(
    "category",
    division.name,
    division.code ? `Division ${division.code}` : undefined,
  );
}

export function fileOpenHandlers(title: string, context?: string) {
  const record = () => trackLibraryActivity("file", title, context);
  return {
    onClick: record,
    onAuxClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.button === 1) record();
    },
  };
}

export async function getLibraryActivity(userId: string, page: number, kind: ActivityKind | "") {
  const query = new URLSearchParams({ page: String(page) });
  if (kind) query.set("kind", kind);
  const data = await apiRequest<ActivityPage>(`/users/${userId}/library-activity?${query}`, {
    cache: "no-store",
  });
  if (!Array.isArray(data?.events) || !data.counts || typeof data.hasNext !== "boolean") {
    throw new Error("The API did not return a library activity timeline.");
  }
  return data;
}

export const footingTitle = "Plain Concrete (PC) Footings & Raft";
export const footingContext = `Concrete / 03 30 00 / ${footingTitle}`;
