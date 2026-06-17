import type { User, UserRole } from "@/types";
import { mapUser } from "./adapters";
import { apiRequest } from "./client";

export async function listUsers(): Promise<User[]> {
  const data = await apiRequest<{ users: User[] }>("/users");
  return data.users.map(mapUser);
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
