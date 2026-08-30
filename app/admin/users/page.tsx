import Link from "next/link";
import { changeAccountStatus, changeUserRole } from "@/app/admin/users/actions";
import { signOut } from "@/app/login/actions";
import { HomeIcon, LogoutIcon, ShieldIcon, UsersIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth/dal";
import { getManagedUsers } from "@/lib/data/users";

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string | null) {
  if (!value) return "ยังไม่มีข้อมูล";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const viewer = await requireAdmin();
  const params = await searchParams;
  const query = one(params.q) ?? "";
  const roleValue = one(params.role);
  const statusValue = one(params.status);
  const role = roleValue === "admin" || roleValue === "user" ? roleValue : undefined;
  const status = statusValue === "active" || statusValue === "disabled" || statusValue === "pending_deletion"
    ? statusValue
    : undefined;
  const users = await getManagedUsers({ query, role, status });
  const notice = one(params.notice);
  const noticeKind = one(params.kind) === "error" ? "error" : "success";
  const activeCount = users.filter((user) => user.status === "active").length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <main className="users-shell">
      <aside className="users-rail" aria-label="เมนู Admin">
        <Link className="users-rail-brand" href="/" aria-label="Teoycodex home">T</Link>
        <nav>
          <Link href="/"><HomeIcon /><span>หน้าแรก</span></Link>
          <Link className="is-active" href="/admin/users" aria-current="page"><UsersIcon /><span>ผู้ใช้</span></Link>
          <span className="is-disabled"><ShieldIcon /><span>สิทธิ์</span></span>
        </nav>
        <form action={signOut}><button type="submit"><LogoutIcon /><span>ออกจากระบบ</span></button></form>
      </aside>

      <section className="users-surface">
        <header className="users-header">
          <div>
            <span>Teoycodex / Operator directory</span>
            <h1>จัดการผู้ใช้</h1>
          </div>
          <dl>
            <div><dt>ผลลัพธ์</dt><dd>{users.length}</dd></div>
            <div><dt>Active</dt><dd>{activeCount}</dd></div>
            <div><dt>Admin</dt><dd>{adminCount}</dd></div>
          </dl>
        </header>

        <section className="users-command" aria-labelledby="directory-heading">
          <div className="section-rule"><span id="directory-heading">User directory</span><span>สูงสุด 200 รายการ</span></div>
          <div className="users-command-copy">
            <div>
              <span>Operator: {viewer.displayName}</span>
              <h2>บัญชีและขอบเขตการเข้าถึง</h2>
              <p>การเปลี่ยน role และสถานะจะถูกตรวจซ้ำในฐานข้อมูลและบันทึกใน audit ledger</p>
            </div>
            <div className="create-user-note">
              <strong>เพิ่มผู้ใช้ใหม่</strong>
              <span>สร้างบัญชีผ่าน Supabase Auth Dashboard ก่อน จนกว่าจะเพิ่ม service-role endpoint</span>
            </div>
          </div>

          <form className="users-filter" method="get">
            <label>
              <span>ค้นหา</span>
              <input name="q" defaultValue={query} placeholder="ชื่อ หรือ User ID" />
            </label>
            <label>
              <span>บทบาท</span>
              <select name="role" defaultValue={role ?? ""}>
                <option value="">ทั้งหมด</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </label>
            <label>
              <span>สถานะ</span>
              <select name="status" defaultValue={status ?? ""}>
                <option value="">ทั้งหมด</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="pending_deletion">Pending deletion</option>
              </select>
            </label>
            <button type="submit">ใช้ตัวกรอง</button>
            <Link href="/admin/users">ล้าง</Link>
          </form>
        </section>

        {notice && <p className={`users-notice is-${noticeKind}`} role="status">{notice}</p>}

        <section className="user-list" aria-label="รายชื่อผู้ใช้">
          <div className="user-list-head">
            <span>Identity</span><span>Role</span><span>Status</span><span>Last activity</span><span>Controls</span>
          </div>
          {users.length === 0 ? (
            <div className="user-empty">
              <span>00</span><h2>ไม่พบผู้ใช้ตามเงื่อนไข</h2><p>ลองล้างตัวกรองหรือสร้างบัญชีใน Supabase Auth Dashboard</p>
            </div>
          ) : users.map((user, index) => {
            const changeRole = changeUserRole.bind(null, user.id);
            const changeStatus = changeAccountStatus.bind(null, user.id);
            const isSelf = user.id === viewer.id;

            return (
              <article className="user-row" key={user.id}>
                <div className="user-identity">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{user.displayName}</strong><code>{user.id}</code>{isSelf && <em>บัญชีของคุณ</em>}</div>
                </div>
                <span className={`role-chip is-${user.role}`}>{user.role}</span>
                <span className={`status-chip is-${user.status}`}><i />{user.status}</span>
                <div className="user-timestamps"><span>{formatDate(user.lastSeenAt)}</span><small>สร้าง {formatDate(user.createdAt)}</small></div>
                <div className="user-controls">
                  <form action={changeRole}>
                    <label htmlFor={`role-${user.id}`}>เปลี่ยน role</label>
                    <select id={`role-${user.id}`} name="role" defaultValue={user.role} disabled={isSelf}>
                      <option value="user">User</option><option value="admin">Admin</option>
                    </select>
                    <button type="submit" disabled={isSelf}>บันทึก</button>
                  </form>
                  <form action={changeStatus}>
                    <input type="hidden" name="status" value={user.status === "active" ? "disabled" : "active"} />
                    <button className="status-action" type="submit" disabled={isSelf}>
                      {user.status === "active" ? "ระงับ" : "เปิดใช้"}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="users-footer">
          <span>Account registry · Supabase RLS</span>
          <strong>{users.length} records</strong>
        </footer>
      </section>
    </main>
  );
}
