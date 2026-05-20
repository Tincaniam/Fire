import { prisma } from "@/lib/prisma";
import NewReportForm from "./NewReportForm";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { siteId } = await searchParams;

  const siteWhere = isSuperAdmin(user)
    ? {}
    : { client: { companyId: user.companyId! } };

  const userWhere = isSuperAdmin(user)
    ? {}
    : { companyId: user.companyId! };

  const [sites, users] = await Promise.all([
    prisma.site.findMany({
      where: siteWhere,
      orderBy: { name: "asc" },
      include: { client: true },
    }),
    prisma.user.findMany({ where: userWhere, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">New Inspection Report</h1>
      <NewReportForm
        sites={sites.map((s) => ({
          id: s.id,
          name: s.name,
          clientName: s.client.name,
        }))}
        users={users.map((u) => ({ id: u.id, name: u.name ?? u.email }))}
        currentUserId={user.id}
        defaultSiteId={siteId}
      />
    </div>
  );
}
