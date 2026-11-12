import type { User } from "@/types";
import { mapUser } from "./adapters";
import { apiRequest } from "./client";

export const EMAIL_DOMAIN = "@rowad-rme.com";

export function isValidCompanyEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 && parts[0].length > 0 && `@${parts[1]}` === EMAIL_DOMAIN;
}

export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; password: string }

export async function login(input: LoginInput): Promise<User> {
  if (!isValidCompanyEmail(input.email)) throw new Error(`Email must end with ${EMAIL_DOMAIN}`);
  const data = await apiRequest<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapUser(data.user);
}

export async function loginAsAdmin(): Promise<User> {
  throw new Error("Demo admin login is disabled. Sign in with an admin account.");
}

export async function register(input: RegisterInput): Promise<{ pendingVerification: true; email: string }> {
  if (!isValidCompanyEmail(input.email)) throw new Error(`Email must end with ${EMAIL_DOMAIN}`);
  await apiRequest<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { pendingVerification: true, email: input.email };
}

export async function verifyEmail(token: string): Promise<User> {
  const data = await apiRequest<{ user: User }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return mapUser(data.user);
}

export async function resendVerificationEmail(
  email: string,
): Promise<{ message: string; retryAfterSeconds?: number }> {
  if (!isValidCompanyEmail(email)) throw new Error(`Email must end with ${EMAIL_DOMAIN}`);
  return apiRequest<{ message: string; retryAfterSeconds?: number }>(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await apiRequest<{ user: User | null }>("/auth/me");
    return data.user ? mapUser(data.user) : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/auth/logout", { method: "POST" });
}
