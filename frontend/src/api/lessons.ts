// TODO: replace with real API calls under /api/lessons
import type { Lesson } from "@/types";
import { mockLessons } from "./mock-data";

const delay = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export async function listLessons(params?: { categoryId?: string; search?: string }): Promise<Lesson[]> {
  // TODO: replace with real API call — GET /api/lessons?categoryId=&search=
  let result = [...mockLessons];
  if (params?.categoryId) result = result.filter((l) => l.categoryId === params.categoryId);
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q),
    );
  }
  return delay(result);
}

export async function getLesson(id: string): Promise<Lesson | null> {
  // TODO: replace with real API call — GET /api/lessons/:id
  return delay(mockLessons.find((l) => l.id === id) ?? null);
}

export async function recentLessons(limit = 4): Promise<Lesson[]> {
  // TODO: replace with real API call — GET /api/lessons?sort=-createdAt&limit=
  return delay([...mockLessons].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit));
}

export async function createLesson(input: Omit<Lesson, "id" | "createdAt" | "categoryName">): Promise<Lesson> {
  // TODO: replace with real API call — POST /api/lessons (multipart for uploads)
  const created: Lesson = {
    ...input,
    id: `l_${Date.now()}`,
    categoryName: input.categoryId,
    createdAt: new Date().toISOString(),
  };
  mockLessons.push(created);
  return delay(created);
}

export async function updateLesson(id: string, patch: Partial<Lesson>): Promise<Lesson> {
  // TODO: replace with real API call — PATCH /api/lessons/:id
  const idx = mockLessons.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Lesson not found");
  mockLessons[idx] = { ...mockLessons[idx], ...patch };
  return delay(mockLessons[idx]);
}

export async function deleteLesson(id: string): Promise<void> {
  // TODO: replace with real API call — DELETE /api/lessons/:id
  const idx = mockLessons.findIndex((l) => l.id === id);
  if (idx !== -1) mockLessons.splice(idx, 1);
  return delay(undefined);
}
