import type { Category, Lesson, LessonAsset, User } from "@/types";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  lessonCount?: number;
};

type ApiLesson = {
  id: string;
  title: string;
  slug?: string;
  categoryId?: string | { id?: string; _id?: string; name?: string; slug?: string };
  categoryName?: string;
  description?: string;
  videoUrl?: string;
  images?: string[] | LessonAsset[];
  pdfUrl?: string;
  instructions?: string;
  bestPractices?: string;
  methodStatement?: string;
  createdAt?: string;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified?: boolean;
  verified?: boolean;
  isActive?: boolean;
  active?: boolean;
  createdAt?: string;
};

export function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified ?? user.isVerified ?? false,
    active: user.active ?? user.isActive ?? true,
    createdAt: user.createdAt ?? "",
  };
}

export function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    icon: "BookOpen",
    thumbnail: category.thumbnailUrl || undefined,
    lessonCount: category.lessonCount ?? 0,
  };
}

function categoryIdFor(lesson: ApiLesson): string {
  if (typeof lesson.categoryId === "string") return lesson.categoryId;
  return lesson.categoryId?.id ?? lesson.categoryId?._id ?? "";
}

function categoryNameFor(lesson: ApiLesson): string {
  if (lesson.categoryName) return lesson.categoryName;
  if (typeof lesson.categoryId === "object" && lesson.categoryId?.name) return lesson.categoryId.name;
  return "";
}

function mapImages(images: ApiLesson["images"]): LessonAsset[] {
  return (images ?? []).map((image, index) => {
    if (typeof image === "string") {
      return { id: `${index}`, url: image };
    }
    return image;
  });
}

export function mapLesson(lesson: ApiLesson): Lesson {
  return {
    id: lesson.id,
    title: lesson.title,
    categoryId: categoryIdFor(lesson),
    categoryName: categoryNameFor(lesson),
    description: lesson.description ?? "",
    videoUrl: lesson.videoUrl || undefined,
    images: mapImages(lesson.images),
    pdfUrl: lesson.pdfUrl || undefined,
    instructions: lesson.instructions ?? "",
    bestPractices: lesson.bestPractices ?? "",
    methodStatement: lesson.methodStatement ?? "",
    createdAt: lesson.createdAt ?? "",
  };
}
