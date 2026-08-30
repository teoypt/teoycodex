"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const { publishableKey, url } = getSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, publishableKey);

  return browserClient;
}
