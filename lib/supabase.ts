import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let cachedUrl = "";
let cachedKey = "";

function getOrCreateClient(url: string, key: string): SupabaseClient {
  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }
  cachedClient = createClient(url, key);
  cachedUrl = url;
  cachedKey = key;
  return cachedClient;
}

export function getSupabaseFromHeaders(headers: Headers): SupabaseClient | null {
  // Server-side env vars take priority
  const envUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return getOrCreateClient(envUrl, envKey);
  }

  // Fall back to client headers
  const url = headers.get("x-supabase-url");
  const key = headers.get("x-supabase-anon-key");
  if (!url || !key) return null;
  return getOrCreateClient(url, key);
}
