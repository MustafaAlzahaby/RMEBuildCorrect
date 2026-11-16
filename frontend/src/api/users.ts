import type { User, UserRole } from "@/types";
import { mapUser } from "./adapters";
import { apiRequest } from "./client";

export type AdminUser = User & {
  progressSummary: {
    guideViews: number;
    trackedOpens: number;
    completedGuides: number;
    lastViewedAt: string | null;
  };
};

export type UserActivityPage = {
  hasNext: boolean;
  guides: {
    id: string;
    guideId: string | null;
    title: string | null;
    lastOpenedAt: string | null;
    completedAt: string | null;
    trackedOpens: number;
  }[];
};

export async function listUsers(): Promise<AdminUser[]> {
  const data = await apiRequest<{ users: AdminUser[] }>("/users");
  return data.users.map((user) => ({ ...mapUser(user), progressSummary: user.progressSummary }));
}

export function getUserActivity(id: string, page: number) {
  return apiRequest<UserActivityPage>(`/users/${id}/activity?page=${page}`);
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const data = await apiRequest<{ user: User }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return mapUser(data.user);
}

export async function setUserActive(id: string, active: boolean): Promise<User> {
  const data = await apiRequest<{ user: User }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ isActive: active }),
  });
  return mapUser(data.user);
}
