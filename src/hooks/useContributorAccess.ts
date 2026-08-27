import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export type ContributorAccess =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "allowed"; role: string };

// Mirrors the protected/userTypes role check on the Violet Verse dashboard:
// being signed in isn't enough — the email also has to have a row in
// `contributors`, which Melissa adds by hand once someone's approved.
export function useContributorAccess(session: Session | null): ContributorAccess {
  const [access, setAccess] = useState<ContributorAccess>({ status: "loading" });

  useEffect(() => {
    if (!session) {
      setAccess({ status: "loading" });
      return;
    }
    let cancelled = false;
    setAccess({ status: "loading" });
    supabase
      .from("contributors")
      .select("role")
      .eq("email", session.user.email)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setAccess(data ? { status: "allowed", role: data.role } : { status: "denied" });
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return access;
}
