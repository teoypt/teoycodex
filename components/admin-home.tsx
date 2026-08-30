/*
THESIS: Admin home behaves like a control ledger; it refuses the generic summary-card dashboard.
OWN-WORLD: Cool technical paper, near-black structure, inspection green, fine rules, and sharp ledger controls.
STORY: Admin enters a permitted task, then scans live access activity from Supabase.
FIRST VIEWPORT: Narrow dark rail; dominant shift brief; right inspection rail; entry rows; activity ledger below; manage-users is the primary action.
FORM: Control Ledger, grounded direction 7, seed 14d74052.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
*/

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/login/actions";
import {
  ArrowIcon,
  CloseIcon,
  HomeIcon,
  InfoIcon,
  LedgerIcon,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/icons";
import type { AccessEvent } from "@/lib/admin-types";

const navItems = [
  { id: "home", label: "หน้าแรก", icon: "home" },
  { id: "users", label: "ผู้ใช้", icon: "users" },
  { id: "permissions", label: "สิทธิ์", icon: "shield" },
  { id: "ledger", label: "บันทึก", icon: "ledger" },
  { id: "settings", label: "ตั้งค่า", icon: "settings" },
] as const;

const iconMap = {
  home: HomeIcon,
  users: UsersIcon,
  shield: ShieldIcon,
  ledger: LedgerIcon,
  settings: SettingsIcon,
};

const entryPoints = [
  { id: "users", title: "จัดการผู้ใช้", description: "เตรียมบัญชีและกำหนดบทบาท Admin หรือ User", icon: UsersIcon },
  { id: "permissions", title: "สิทธิ์และเส้นทาง", description: "ตรวจสอบ route ที่แต่ละบทบาทได้รับอนุญาต", icon: ShieldIcon },
  { id: "ledger", title: "บันทึกการเข้าถึง", description: "ค้นหาประวัติการใช้งานและเหตุการณ์สำคัญ", icon: LedgerIcon },
] as const;

type Filter = "ทั้งหมด" | "Admin" | "User";

type AdminHomeProps = {
  accessEvents: AccessEvent[];
  connectionLabel: string;
  currentRole: "Admin";
};

export default function AdminHome({
  accessEvents,
  connectionLabel,
  currentRole,
}: AdminHomeProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [filter, setFilter] = useState<Filter>("ทั้งหมด");
  const [notice, setNotice] = useState("เชื่อมต่อ Supabase แล้ว");

  const filteredEvents = useMemo(
    () => (filter === "ทั้งหมด" ? accessEvents : accessEvents.filter((event) => event.role === filter)),
    [accessEvents, filter],
  );

  const selectDestination = (id: string, label: string) => {
    setActiveNav(id);
    setMenuOpen(false);
    if (id === "users") {
      router.push("/admin/users");
      return;
    }
    if (id === "home") {
      setNotice("คุณอยู่ที่หน้าแรกของ Admin");
      return;
    }
    setNotice(`${label} ถูกเตรียมเป็นจุดเชื่อมต่อสำหรับเฟสถัดไป`);
  };

  return (
    <main className="admin-shell min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <aside className={`control-rail ${menuOpen ? "is-open" : ""}`} aria-label="เมนูผู้ดูแลระบบ">
        <div className="rail-brand" aria-label="Teoycodex">
          <span>T</span>
          <strong>Teoycodex</strong>
        </div>

        <nav className="rail-nav">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <button
                key={item.id}
                type="button"
                className={activeNav === item.id ? "is-active" : ""}
                aria-current={activeNav === item.id ? "page" : undefined}
                onClick={() => selectDestination(item.id, item.label)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="rail-foot">
          <div className="rail-mode">
            <span>โหมด</span>
            <strong>Operate</strong>
          </div>
          <form action={signOut}>
            <button type="submit">
              <LogoutIcon />
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>

      {menuOpen && <button className="menu-backdrop" aria-label="ปิดเมนู" onClick={() => setMenuOpen(false)} />}

      <section className="control-surface">
        <header className="top-register">
          <div className="wordmark">
            <span>Teoycodex</span>
            <div>
              <strong>Control Ledger</strong>
              <small>Admin home</small>
            </div>
          </div>
          <dl className="register-meta">
            <div><dt>บทบาท</dt><dd>{currentRole ?? "—"}</dd></div>
            <div><dt>โหมด</dt><dd>Operate</dd></div>
            <div><dt>เวอร์ชัน</dt><dd>0.1.0</dd></div>
          </dl>
        </header>

        <div className="surface-grid">
          <section className="shift-brief" aria-labelledby="page-title">
            <div className="section-rule"><span>Shift brief</span><span>Live</span></div>
            <h1 id="page-title">สวัสดี <em>Admin</em></h1>
            <p className="brief-lead">หน้าเริ่มต้นสำหรับควบคุมสิทธิ์ เส้นทาง และการเข้าถึงของ Teoycodex</p>

            <div className="truth-note">
              <InfoIcon />
              <div>
                <strong>Supabase พร้อมใช้งาน</strong>
                <p>ข้อมูลผู้ใช้ บทบาท และ audit ledger ถูกอ่านผ่าน session ที่ยืนยันแล้วและบังคับสิทธิ์ด้วย Row Level Security</p>
              </div>
            </div>

            <div className="entry-register" aria-label="จุดเริ่มต้นงานผู้ดูแลระบบ">
              {entryPoints.map((entry, index) => {
                const Icon = entry.icon;
                return (
                  <button key={entry.id} type="button" onClick={() => selectDestination(entry.id, entry.title)}>
                    <span className="entry-index">{String(index + 1).padStart(2, "0")}</span>
                    <Icon />
                    <span className="entry-copy">
                      <strong>{entry.title}</strong>
                      <small>{entry.description}</small>
                    </span>
                    <ArrowIcon className="entry-arrow" />
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="inspection-rail" aria-labelledby="inspection-title">
            <div className="section-rule"><span id="inspection-title">Inspection</span></div>
            <dl>
              <div><dt>System state</dt><dd><span className="status-mark" />พร้อมใช้งาน</dd></div>
              <div><dt>Data source</dt><dd>Supabase</dd></div>
              <div><dt>Backend</dt><dd>เชื่อมต่อแล้ว</dd></div>
              <div><dt>Supabase</dt><dd>{connectionLabel}</dd></div>
            </dl>
            <button className="primary-action" type="button" onClick={() => selectDestination("users", "จัดการผู้ใช้")}>
              <UsersIcon />
              <span>จัดการผู้ใช้</span>
              <ArrowIcon />
            </button>
            <p className="role-note">RBAC รอบแรกมีเพียง <strong>Admin</strong> และ <strong>User</strong></p>
          </aside>
        </div>

        <section className="activity-ledger" aria-labelledby="activity-title">
          <div className="ledger-heading">
            <div>
              <h2 id="activity-title">บันทึกการเข้าถึงล่าสุด</h2>
              <span>ข้อมูลจาก Supabase · เรียงใหม่ไปเก่า</span>
            </div>
            <div className="role-filter" aria-label="กรองตามบทบาท">
              {(["ทั้งหมด", "Admin", "User"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={filter === option ? "is-selected" : ""}
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="ledger-scroll">
            <table>
              <thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>บทบาท</th><th>การดำเนินการ</th><th>รายละเอียด</th></tr></thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan={5}>ยังไม่มี audit event ในระบบ</td></tr>
                ) : filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.time}</td><td>{event.actor}</td><td>{event.role}</td><td>{event.action}</td><td>{event.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer>
            <span><span className="status-mark" /> {connectionLabel}</span>
            <strong>{filteredEvents.length} รายการ</strong>
          </footer>
        </section>

        <div className="system-strip" aria-live="polite">
          <span>System state</span>
          <strong>{notice}</strong>
          <span>Asia/Bangkok · Supabase live</span>
        </div>
      </section>
    </main>
  );
}
