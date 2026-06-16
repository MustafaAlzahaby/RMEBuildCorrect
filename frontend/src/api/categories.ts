// TODO: replace with real API call — GET /api/categories
import type { Category } from "@/types";
import { mockCategories } from "./mock-data";

const delay = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export async function listCategories(): Promise<Category[]> {
  // TODO: replace with real API call — GET /api/categories
  return delay(mockCategories);
}

export async function getCategory(id: string): Promise<Category | null> {
  // TODO: replace with real API call — GET /api/categories/:id
  return delay(mockCategories.find((c) => c.id === id) ?? null);
}

export async function createCategory(input: Omit<Category, "id" | "lessonCount">): Promise<Category> {
  // TODO: replace with real API call — POST /api/categories
  const created: Category = { ...input, id: `c_${Date.now()}`, lessonCount: 0 };
  mockCategories.push(created);
  return delay(created);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  // TODO: replace with real API call — PATCH /api/categories/:id
  const idx = mockCategories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Category not found");
  mockCategories[idx] = { ...mockCategories[idx], ...patch };
  return delay(mockCategories[idx]);
}

export async function deleteCategory(id: string): Promise<void> {
  // TODO: replace with real API call — DELETE /api/categories/:id
  const idx = mockCategories.findIndex((c) => c.id === id);
  if (idx !== -1) mockCategories.splice(idx, 1);
  return delay(undefined);
}
