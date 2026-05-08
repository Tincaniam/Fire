import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar user={{ name: session.user?.name, email: session.user?.email }} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
