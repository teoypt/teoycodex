import "server-only";

import { requireAdmin } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export type ManagedUser = {
  createdAt: string;
  displayName: string;
  grantedAt: string;
  id: string;
  lastSeenAt: string | null;
  role: "admin" | "user";
  status: "active" | "disabled" | "pending_deletion";
};

type UserFilters = {
  query?: string;
  role?: "admin" | "user";
  status?: "active" | "disabled" | "pending_deletion";
};

export async function getManagedUsers(filters: UserFilters) {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, status, created_at, last_seen_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("user_roles").select("user_id, role, granted_at"),
    ]);

  if (profilesError || rolesError) {
    throw new Error(profilesError?.message ?? rolesError?.message ?? "Unable to load users");
  }

  const roleByUser = new Map((roles ?? []).map((row) => [row.user_id, row]));
  const query = filters.query?.trim().toLocaleLowerCase("th") ?? "";

  return (profiles ?? [])
    .flatMap<ManagedUser>((profile) => {
      const role = roleByUser.get(profile.id);
      if (!role) return [];

      return [{
        createdAt: profile.created_at,
        displayName: profile.display_name ?? "ยังไม่ได้ตั้งชื่อ",
        grantedAt: role.granted_at,
        id: profile.id,
        lastSeenAt: profile.last_seen_at,
        role: role.role,
        status: profile.status,
      }];
    })
    .filter((user) => !filters.role || user.role === filters.role)
    .filter((user) => !filters.status || user.status === filters.status)
    .filter((user) => {
      if (!query) return true;
      return user.displayName.toLocaleLowerCase("th").includes(query) || user.id.toLowerCase().includes(query);
    });
}
