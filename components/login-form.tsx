"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { message: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form className="login-form" action={formAction}>
      <div className="login-field">
        <label htmlFor="email">อีเมล</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          required
        />
      </div>
      <div className="login-field">
        <label htmlFor="password">รหัสผ่าน</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          required
        />
      </div>
      <p className="login-message" aria-live="polite">
        {state.message || "ใช้บัญชีที่สร้างไว้ใน Supabase Auth"}
      </p>
      <button type="submit" disabled={pending}>
        <span>{pending ? "กำลังตรวจสอบ" : "เข้าสู่ระบบ"}</span>
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
