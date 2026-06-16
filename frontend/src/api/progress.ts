// TODO: replace with real API calls under /api/progress
import type { DashboardSummary } from "@/types";
import { mockCategories, mockCompletedLessonIds, mockLessons } from "./mock-data";

const delay = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

function getCompleted(userId: string): Set<string> {
  return new Set(mockCompletedLessonIds[userId] ?? []);
}

export async function isLessonComplete(userId: string, lessonId: string): Promise<boolean> {
  // TODO: replace with real API call — GET /api/progress/:lessonId
  return delay(getCompleted(userId).has(lessonId));
}

export async function setLessonComplete(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<boolean> {
  // TODO: replace with real API call — PUT /api/progress/:lessonId
  const list = mockCompletedLessonIds[userId] ?? (mockCompletedLessonIds[userId] = []);
  const idx = list.indexOf(lessonId);
  if (completed && idx === -1) list.push(lessonId);
  if (!completed && idx !== -1) list.splice(idx, 1);
  return delay(completed);
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  // TODO: replace with real API call — GET /api/progress/summary
  const completed = getCompleted(userId);
  const total = mockLessons.length;
  const done = mockLessons.filter((l) => completed.has(l.id)).length;

  const perCategory = mockCategories.map((c) => {
    const lessonsIn = mockLessons.filter((l) => l.categoryId === c.id);
    return {
      categoryId: c.id,
      categoryName: c.name,
      total: lessonsIn.length,
      completed: lessonsIn.filter((l) => completed.has(l.id)).length,
    };
  });

  const recentlyCompleted = mockLessons
    .filter((l) => completed.has(l.id))
    .slice(0, 5)
    .map((l) => ({ lesson: l, completedAt: new Date().toISOString() }));

  return delay({
    overallPercent: total ? Math.round((done / total) * 100) : 0,
    completedCount: done,
    totalCount: total,
    perCategory,
    recentlyCompleted,
  });
}
