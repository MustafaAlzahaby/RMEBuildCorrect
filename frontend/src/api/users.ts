// TODO: replace with real API calls under /api/users
import type { User, UserRole } from "@/types";
import { mockUsers } from "./mock-data";

const delay = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export async function listUsers(): Promise<User[]> {
  // TODO: replace with real API call — GET /api/users
  return delay([...mockUsers]);
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  // TODO: replace with real API call — PATCH /api/users/:id/role
  const u = mockUsers.find((x) => x.id === id);
  if (!u) throw new Error("User not found");
  u.role = role;
  return delay(u);
}

export async function setUserActive(id: string, active: boolean): Promise<User> {
  // TODO: replace with real API call — PATCH /api/users/:id/status
  const u = mockUsers.find((x) => x.id === id);
  if (!u) throw new Error("User not found");
  u.active = active;
  return delay(u);
}
