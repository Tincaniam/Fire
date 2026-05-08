import { prisma } from "@/lib/prisma";
import NewReportForm from "./NewReportForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { siteId } = await searchParams;

  const [sites, users] = await Promise.all([
    prisma.site.findMany({
      orderBy: { name: "asc" },
      include: { client: true },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
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
        currentUserId={session.user?.id ?? ""}
        defaultSiteId={siteId}
      />
    </div>
  );
}
