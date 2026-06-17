import type { DashboardSummary } from "@/types";
import { buildDashboardSummary } from "./adapters";
import { apiRequest } from "./client";
import { listLessons } from "./lessons";

type ProgressResponse = {
  completedLessons: Array<{
    lessonId?: string | { id?: string; _id?: string };
    completedAt?: string;
  }>;
};

function lessonIdFromProgress(item: ProgressResponse["completedLessons"][number]) {
  if (typeof item.lessonId === "string") return item.lessonId;
  return item.lessonId?.id ?? item.lessonId?._id ?? "";
}

async function completedSet(): Promise<Set<string>> {
  const data = await apiRequest<ProgressResponse>("/progress");
  return new Set(data.completedLessons.map(lessonIdFromProgress).filter(Boolean));
}

export async function isLessonComplete(_userId: string, lessonId: string): Promise<boolean> {
  return (await completedSet()).has(lessonId);
}

export async function setLessonComplete(
  _userId: string,
  lessonId: string,
  completed: boolean,
): Promise<boolean> {
  await apiRequest<void>(`/progress/${lessonId}`, {
    method: completed ? "POST" : "DELETE",
  });
  return completed;
}

export async function getDashboardSummary(_userId: string): Promise<DashboardSummary> {
  const [lessons, completed] = await Promise.all([listLessons(), completedSet()]);
  return buildDashboardSummary(lessons, completed);
}
