import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { getViewer } from "@/lib/auth/dal";

export default async function UnauthorizedPage() {
  const viewer = await getViewer();

  return (
    <main className="access-denied">
      <span className="access-code">403</span>
      <div>
        <p>Permission boundary</p>
        <h1>บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้า Admin</h1>
        <p>
          บทบาทปัจจุบัน: <strong>{viewer?.role ?? "ไม่ทราบ"}</strong> · สถานะ: {viewer?.status ?? "ไม่ทราบ"}
        </p>
        <div className="access-actions">
          <Link href="/">ตรวจสอบอีกครั้ง</Link>
          <form action={signOut}><button type="submit">ออกจากระบบ</button></form>
        </div>
      </div>
    </main>
  );
}
