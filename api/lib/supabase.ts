export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_TABLE_NAME || "Expert_Network";
  return { url, serviceRoleKey, tableName };
}

export function isValidSupabaseUrl(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url);
}

export class SupabaseConfigError extends Error {}

export async function supabaseRequest(
  method: "POST" | "PATCH",
  path: string,
  body: unknown
): Promise<{ status: number } & ({ ok: true; data: unknown } | { ok: false; errorBody: string })> {
  const { url, serviceRoleKey } = getSupabaseConfig();

  if (!url || !serviceRoleKey) {
    throw new SupabaseConfigError(
      "Supabase is not configured: missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  if (!isValidSupabaseUrl(url)) {
    throw new SupabaseConfigError(
      `SUPABASE_URL is set to "${url}", which is not a valid Supabase project API URL (expected https://<project-ref>.supabase.co). This is likely the dashboard URL instead of the Project URL from Settings > API.`
    );
  }

  const res = await fetch(`${url.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    return { ok: false, status: res.status, errorBody };
  }
  const data = await res.json();
  return { ok: true, status: res.status, data };
}
