import type { Lesson, LessonAsset } from "@/types";
import { mapLesson } from "./adapters";
import { apiRequest } from "./client";

export type LessonFormInput = Omit<Lesson, "id" | "createdAt" | "categoryName"> & {
  slug?: string;
  videoFile?: File | null;
  imageFiles?: FileList | File[] | null;
  pdfFile?: File | null;
};

function lessonFormData(input: Partial<LessonFormInput>) {
  const formData = new FormData();
  const fields: Array<keyof LessonFormInput> = [
    "title",
    "slug",
    "categoryId",
    "description",
    "instructions",
    "bestPractices",
    "methodStatement",
    "itp",
    "lessonLearnt",
  ];

  fields.forEach((field) => {
    const value = input[field];
    if (typeof value === "string" && (field !== "slug" || value.trim())) {
      formData.append(field, value);
    }
  });

  if (input.videoFile) {
    formData.append("video", input.videoFile);
  }

  if (input.pdfFile) {
    formData.append("pdf", input.pdfFile);
  }

  Array.from(input.imageFiles ?? []).forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}

export async function listLessons(params?: {
  categoryId?: string;
  search?: string;
}): Promise<Lesson[]> {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("category", params.categoryId);

  const data = await apiRequest<{ lessons: Lesson[] }>(`/lessons${query.size ? `?${query}` : ""}`);
  const lessons = data.lessons.map(mapLesson);

  if (!params?.search) {
    return lessons;
  }

  const search = params.search.toLowerCase();
  return lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(search) ||
      lesson.description.toLowerCase().includes(search),
  );
}

export async function getLesson(idOrSlug: string): Promise<Lesson | null> {
  try {
    const data = await apiRequest<{ lesson: Lesson }>(`/lessons/${encodeURIComponent(idOrSlug)}`);
    return mapLesson(data.lesson);
  } catch {
    return null;
  }
}

export async function recentLessons(limit = 4): Promise<Lesson[]> {
  const lessons = await listLessons();
  return lessons.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export async function createLesson(input: LessonFormInput): Promise<Lesson> {
  const data = await apiRequest<{ lesson: Lesson }>("/lessons", {
    method: "POST",
    body: lessonFormData(input),
  });
  return mapLesson(data.lesson);
}

export async function updateLesson(id: string, patch: Partial<LessonFormInput>): Promise<Lesson> {
  const data = await apiRequest<{ lesson: Lesson }>(`/lessons/${id}`, {
    method: "PUT",
    body: lessonFormData(patch),
  });
  return mapLesson(data.lesson);
}

export async function deleteLesson(id: string): Promise<void> {
  await apiRequest<void>(`/lessons/${id}`, { method: "DELETE" });
}

export function firstAssetUrl(images: LessonAsset[]): string | undefined {
  return images[0]?.url;
}
