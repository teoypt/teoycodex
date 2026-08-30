"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function finish(message: string, kind: "success" | "error" = "success") {
  revalidatePath("/admin/users");
  redirect(`/admin/users?notice=${encodeURIComponent(message)}&kind=${kind}`);
}

export async function changeUserRole(userId: string, formData: FormData) {
  await requireAdmin();
  const role = String(formData.get("role") ?? "");

  if (!isUuid(userId) || (role !== "admin" && role !== "user")) {
    finish("ข้อมูลบทบาทไม่ถูกต้อง", "error");
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_set_user_role", {
    p_new_role: role as "admin" | "user",
    p_reason: "เปลี่ยนจากหน้าจัดการผู้ใช้",
    p_target_user_id: userId,
  });

  if (error) finish(`เปลี่ยนบทบาทไม่สำเร็จ (${error.code})`, "error");
  finish("อัปเดตบทบาทและบันทึก audit แล้ว");
}

export async function changeAccountStatus(userId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");

  if (!isUuid(userId) || (status !== "active" && status !== "disabled")) {
    finish("ข้อมูลสถานะไม่ถูกต้อง", "error");
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("admin_set_account_status", {
    p_new_status: status as "active" | "disabled",
    p_reason: "เปลี่ยนจากหน้าจัดการผู้ใช้",
    p_target_user_id: userId,
  });

  if (error) finish(`เปลี่ยนสถานะไม่สำเร็จ (${error.code})`, "error");
  finish(status === "active" ? "เปิดใช้งานบัญชีแล้ว" : "ระงับการเข้าถึงบัญชีแล้ว");
}
