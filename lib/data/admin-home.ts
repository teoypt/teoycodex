import "server-only";

import type { AccessEvent } from "@/lib/admin-types";
import { requireAdmin } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

type AdminHomeData = {
  accessEvents: AccessEvent[];
  connectionLabel: string;
  currentRole: "Admin";
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function toDisplayAction(action: string) {
  const labels: Record<string, string> = {
    "auth.login_failed": "เข้าสู่ระบบไม่สำเร็จ",
    "auth.login_succeeded": "เข้าสู่ระบบ",
    "auth.permission_denied": "ถูกปฏิเสธ",
    "setting.updated": "แก้ไขการตั้งค่า",
    "user.disabled": "ปิดบัญชี",
    "user.enabled": "เปิดบัญชี",
    "user.role_changed": "เปลี่ยนบทบาท",
  };

  return labels[action] ?? action;
}

function toAccessEvent(row: {
  action: string;
  actor_label: string | null;
  actor_role: "admin" | "user" | null;
  actor_user_id: string | null;
  id: number;
  occurred_at: string;
  resource_id: string | null;
  resource_type: string | null;
  result: "denied" | "failure" | "success";
}): AccessEvent {
  const resource = [row.resource_type, row.resource_id].filter(Boolean).join(" · ");

  return {
    action: toDisplayAction(row.action),
    actor: row.actor_label ?? row.actor_user_id?.slice(0, 8) ?? "system",
    detail: resource || row.result,
    id: String(row.id),
    role: row.actor_role === "user" ? "User" : "Admin",
    time: formatTime(row.occurred_at),
  };
}

export async function getAdminHomeData(): Promise<AdminHomeData> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("audit_logs")
    .select(
      "id, occurred_at, actor_user_id, actor_role, actor_label, action, resource_type, resource_id, result",
    )
    .order("occurred_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Unable to read audit logs from Supabase (${error.code})`);
  }

  return {
    accessEvents: (rows ?? []).map(toAccessEvent),
    connectionLabel: "เชื่อม Supabase และตรวจสอบสิทธิ์ด้วย RLS แล้ว",
    currentRole: "Admin",
  };
}
