/**
 * Shared CORS + JWT authentication helpers for all edge functions.
 *
 * Every non-public function must call `requireUser(req)` before doing any work.
 * It validates the caller's Supabase session JWT (not just the presence of a
 * header) and returns the authenticated user, or a ready-to-return 401 Response.
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Preflight requests must never require a JWT. */
export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export interface AuthContext {
  user: { id: string; email?: string };
  supabase: SupabaseClient;
  authHeader: string;
}

export interface AuthFailure {
  response: Response;
}

export function isAuthFailure(r: AuthContext | AuthFailure): r is AuthFailure {
  return (r as AuthFailure).response !== undefined;
}

/**
 * Validate the caller's JWT. Returns either an AuthContext with a
 * user-scoped Supabase client (RLS applies as that user) or an AuthFailure
 * carrying a 401 response.
 */
export async function requireUser(req: Request): Promise<AuthContext | AuthFailure> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { response: jsonResponse({ error: "Unauthorized: missing bearer token" }, 401) };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.error("[auth] rejected request:", error?.message ?? "no user for token");
    return { response: jsonResponse({ error: "Unauthorized: invalid or expired session" }, 401) };
  }

  return { user: { id: data.user.id, email: data.user.email ?? undefined }, supabase, authHeader };
}
