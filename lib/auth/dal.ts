import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  displayName: string;
  role: "admin" | "user";
  status: "active" | "disabled" | "pending_deletion";
};

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const [{ data: profile, error: profileError }, { data: role, error: roleError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, status")
        .eq("id", authData.user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .maybeSingle(),
    ]);

  if (profileError || roleError || !profile || !role) return null;

  return {
    displayName: profile.display_name ?? "ผู้ใช้",
    id: authData.user.id,
    role: role.role,
    status: profile.status,
  };
});

export async function requireAdmin() {
  const viewer = await getViewer();

  if (!viewer) redirect("/login");
  if (viewer.status !== "active" || viewer.role !== "admin") redirect("/unauthorized");

  return viewer;
}
