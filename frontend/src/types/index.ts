// Shared TypeScript domain types. These mirror the shape of the future REST API.

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // lucide icon name
  thumbnail?: string;
  lessonCount: number;
}

export interface LessonAsset {
  id: string;
  url: string;
  caption?: string;
}

export interface Lesson {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  videoUrl?: string;
  images: LessonAsset[];
  pdfUrl?: string;
  instructions: string;
  bestPractices: string;
  methodStatement: string;
  createdAt: string;
}

export interface ViewHistoryEntry {
  guideId: string;
  viewedAt: string;
}
