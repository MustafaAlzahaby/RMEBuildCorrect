import type { Category } from "@/types";

export function isDivision(category: Category) {
  return !category.parentId;
}

export function childrenOf(categories: Category[], parentId: string) {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((a, b) => a.code.localeCompare(b.code) || a.name.localeCompare(b.name));
}

export function parentOf(categories: Category[], category?: Category | null) {
  if (!category?.parentId) return undefined;
  return categories.find((item) => item.id === category.parentId);
}

export function categoryLabel(category: Category) {
  if (isDivision(category)) {
    return category.code ? `DIVISION ${category.code} - ${category.name}` : category.name;
  }
  return category.code ? `${category.code} - ${category.name}` : category.name;
}

export function matchesCategoryQuery(category: Category, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  return (
    category.name.toLowerCase().includes(search) ||
    category.code.toLowerCase().includes(search) ||
    category.description.toLowerCase().includes(search) ||
    categoryLabel(category).toLowerCase().includes(search)
  );
}

export function lessonBelongsToCategory(
  lessonCategoryId: string,
  selectedCategoryId: string | undefined,
  categories: Category[],
) {
  if (!selectedCategoryId) return true;
  if (lessonCategoryId === selectedCategoryId) return true;
  return childrenOf(categories, selectedCategoryId).some((child) => child.id === lessonCategoryId);
}
