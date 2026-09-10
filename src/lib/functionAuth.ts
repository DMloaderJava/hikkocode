/**
 * Auth helpers for direct fetch() calls to Supabase Edge Functions.
 *
 * All edge functions run with verify_jwt = true, so every request must carry
 * the logged-in user's access token — the anon publishable key is NOT enough.
 */

import { supabase } from "@/integrations/supabase/client";

export class NotAuthenticatedError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "NotAuthenticatedError";
  }
}

/** Returns the current access token or throws NotAuthenticatedError. */
export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[functionAuth] failed to read session:", error);
    throw new NotAuthenticatedError();
  }
  const token = data.session?.access_token;
  if (!token) throw new NotAuthenticatedError();
  return token;
}

/** Standard headers (JSON + user JWT) for edge function calls. */
export async function getFunctionHeaders(
  extra: Record<string, string> = {},
): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

/** Redirect an unauthenticated user to the login page. */
export function redirectToAuth(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
    window.location.assign("/auth");
  }
}
