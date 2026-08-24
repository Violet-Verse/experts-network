import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Supabase client is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. " +
      "Auth and the dashboard will not work until these are set."
  );
}

// createClient throws synchronously on an empty URL, which would crash the
// whole app before it renders. Fall back to a harmless placeholder so the
// app still loads (auth calls will just fail with a clear error) when the
// env vars aren't set yet, e.g. in local dev without a .env.local.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
