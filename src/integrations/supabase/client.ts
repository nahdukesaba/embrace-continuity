import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Browser Supabase client used solely for direct Storage uploads of proof
 * photos. Returns null when env vars are not configured — callers should fall
 * back to multipart upload through the API in that case.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  if (cached) return cached;
  cached = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
