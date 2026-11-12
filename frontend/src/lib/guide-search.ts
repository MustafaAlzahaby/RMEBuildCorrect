import type { Category, Lesson } from "@/types";
import { matchesCategoryQuery, parentOf } from "./categories";

export function matchesGuideQuery(guide: Lesson, query: string, categories: Category[]): boolean {
  const search = query.trim().toLowerCase();
  if (!search) return true;

  const section = categories.find((category) => category.id === guide.categoryId);
  const division = parentOf(categories, section);
  return (
    [
      guide.title,
      guide.description,
      guide.categoryName,
      guide.instructions,
      guide.bestPractices,
      guide.methodStatement,
      guide.itp,
      guide.lessonLearnt,
    ].some((text) => text.toLowerCase().includes(search)) ||
    Boolean(section && matchesCategoryQuery(section, search)) ||
    Boolean(division && matchesCategoryQuery(division, search))
  );
}
