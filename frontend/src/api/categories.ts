import type { Category } from "@/types";
import { mapCategory } from "./adapters";
import { apiRequest } from "./client";

type CategoryInput = Omit<Category, "id" | "lessonCount">;

function toCategoryPayload(input: Partial<CategoryInput>) {
  return {
    name: input.name,
    slug: input.slug?.trim() || undefined,
    code: input.code,
    parentId: input.parentId || null,
    description: input.description,
    thumbnailUrl: input.thumbnail,
  };
}

export async function listCategories(): Promise<Category[]> {
  const data = await apiRequest<{ categories: Category[] }>("/categories");
  return data.categories.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
  try {
    const data = await apiRequest<{ category: Category }>(
      `/categories/${encodeURIComponent(slug)}`,
    );
    return mapCategory(data.category);
  } catch {
    return null;
  }
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const data = await apiRequest<{ category: Category }>("/categories", {
    method: "POST",
    body: JSON.stringify(toCategoryPayload(input)),
  });
  return mapCategory(data.category);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  const data = await apiRequest<{ category: Category }>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(toCategoryPayload(patch)),
  });
  return mapCategory(data.category);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<void>(`/categories/${id}`, { method: "DELETE" });
}
