import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-[70vh] bg-crema-alt/50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
