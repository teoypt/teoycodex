import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { publishableKey, url } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims verifies the token and refreshes it when needed. Authorization
  // still belongs in the server data layer and Postgres RLS, not in Proxy.
  await supabase.auth.getClaims();

  return response;
}
