import type { ViewHistoryEntry } from "@/types";
import { apiRequest } from "./client";

type HistoryResponse = {
  history: Array<{
    lessonId?: string | { id?: string; _id?: string };
    viewedAt?: string;
    completedAt?: string;
  }>;
};

function lessonIdFromHistory(item: HistoryResponse["history"][number]) {
  if (typeof item.lessonId === "string") return item.lessonId;
  return item.lessonId?.id ?? item.lessonId?._id ?? "";
}

export async function recordGuideView(lessonId: string): Promise<void> {
  await apiRequest<void>(`/progress/${lessonId}`, {
    method: "POST",
  });
}

export async function getViewHistory(): Promise<ViewHistoryEntry[]> {
  const data = await apiRequest<HistoryResponse>("/progress");
  return data.history
    .map((item) => ({
      guideId: lessonIdFromHistory(item),
      viewedAt: item.viewedAt ?? item.completedAt ?? "",
    }))
    .filter((item) => item.guideId && item.viewedAt);
}
