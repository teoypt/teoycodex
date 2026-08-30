import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { getViewer } from "@/lib/auth/dal";

export default async function LoginPage() {
  const viewer = await getViewer();
  if (viewer?.status === "active" && viewer.role === "admin") redirect("/");

  return (
    <main className="login-shell">
      <section className="login-brand" aria-labelledby="login-title">
        <div className="login-brand-mark">T</div>
        <div className="login-kicker">Teoycodex / Access control</div>
        <h1 id="login-title">เข้าสู่<br /><em>Control Ledger</em></h1>
        <p>พื้นที่ปฏิบัติงานสำหรับจัดการผู้ใช้ บทบาท และบันทึกการเข้าถึง</p>
        <dl>
          <div><dt>Auth provider</dt><dd>Supabase</dd></div>
          <div><dt>Policy</dt><dd>RLS enforced</dd></div>
          <div><dt>Timezone</dt><dd>Asia/Bangkok</dd></div>
        </dl>
      </section>
      <section className="login-panel" aria-label="แบบฟอร์มเข้าสู่ระบบ">
        <div className="section-rule"><span>Identity check</span><span>01 / 01</span></div>
        <div className="login-panel-copy">
          <span>Admin access</span>
          <h2>ยืนยันตัวตน</h2>
          <p>ระบบจะตรวจ session, สถานะบัญชี และบทบาทอีกครั้งก่อนอ่านข้อมูล</p>
        </div>
        <LoginForm />
        <footer>Authentication ≠ Authorization · ตรวจสิทธิ์ทุกคำขอ</footer>
      </section>
    </main>
  );
}
