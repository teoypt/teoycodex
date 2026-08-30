import AdminHome from "@/components/admin-home";
import { getAdminHomeData } from "@/lib/data/admin-home";

export default async function Page() {
  const data = await getAdminHomeData();

  return <AdminHome {...data} />;
}
