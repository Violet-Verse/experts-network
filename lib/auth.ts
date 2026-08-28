import { getSupabaseConfig } from "./supabase.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export async function getAuthenticatedUser(
  authHeader: string | undefined
): Promise<AuthenticatedUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) return null;

  const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { id?: string; email?: string };
  if (!data.id || !data.email) return null;
  return { id: data.id, email: data.email };
}
