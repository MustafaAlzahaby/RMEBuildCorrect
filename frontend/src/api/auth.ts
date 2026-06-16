// TODO: replace with real API calls under /api/auth
import type { User } from "@/types";
import { mockUsers } from "./mock-data";

const delay = <T,>(value: T, ms = 250): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export const EMAIL_DOMAIN = "@rowad-rme.com";

export function isValidCompanyEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(EMAIL_DOMAIN);
}

export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; password: string }

export async function login(input: LoginInput): Promise<User> {
  // TODO: replace with real API call — POST /api/auth/login
  if (!isValidCompanyEmail(input.email)) throw new Error(`Email must end with ${EMAIL_DOMAIN}`);
  const found = mockUsers.find((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
  // Demo helper: if no match, return first regular user
  return delay(found ?? mockUsers[0]);
}

export async function loginAsAdmin(): Promise<User> {
  // Demo helper — returns the seeded admin user.
  return delay(mockUsers.find((u) => u.role === "admin")!);
}

export async function register(input: RegisterInput): Promise<{ pendingVerification: true; email: string }> {
  // TODO: replace with real API call — POST /api/auth/register
  if (!isValidCompanyEmail(input.email)) throw new Error(`Email must end with ${EMAIL_DOMAIN}`);
  return delay({ pendingVerification: true, email: input.email });
}

export async function logout(): Promise<void> {
  // TODO: replace with real API call — POST /api/auth/logout
  return delay(undefined);
}
