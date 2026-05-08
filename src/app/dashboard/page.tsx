import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Building2, AlertTriangle, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [clientCount, siteCount, reportCount, openDeficiencies] = await Promise.all([
    prisma.client.count(),
    prisma.site.count(),
    prisma.inspectionReport.count(),
    prisma.deficiency.count({ where: { resolved: false } }),
  ]);

  const recentReports = await prisma.inspectionReport.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { site: { include: { client: true } }, technician: true },
  });

  const stats = [
    { label: "Clients", value: clientCount, icon: Building2, href: "/dashboard/clients" },
    { label: "Sites", value: siteCount, icon: Building2, href: "/dashboard/clients" },
    { label: "Reports", value: reportCount, icon: ClipboardList, href: "/dashboard/reports" },
    { label: "Open Deficiencies", value: openDeficiencies, icon: AlertTriangle, href: "/dashboard/reports", warn: openDeficiencies > 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Welcome back, {session.user?.name?.split(" ")[0] ?? "there"}.
          </p>
        </div>
        <Link
          href="/dashboard/reports/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, warn }) => (
          <Link
            key={label}
            href={href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <Icon className={`w-4 h-4 ${warn ? "text-amber-400" : "text-gray-600"}`} />
            </div>
            <p className={`text-3xl font-bold ${warn ? "text-amber-400" : "text-white"}`}>
              {value}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Recent Reports
          </h2>
          <Link href="/dashboard/reports" className="text-xs text-red-400 hover:text-red-300">
            View all →
          </Link>
        </div>
        {recentReports.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-8 text-center">
            <ClipboardList className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No reports yet.</p>
            <Link
              href="/dashboard/reports/new"
              className="text-red-400 hover:text-red-300 text-sm mt-1 inline-block"
            >
              Create your first report →
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase">
                  <th className="text-left px-4 py-3">Client / Site</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/reports/${r.id}`} className="hover:text-red-400">
                        <span className="text-white font-medium">{r.site.client.name}</span>
                        <span className="text-gray-500"> / {r.site.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {r.serviceType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(r.inspectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-gray-800 text-gray-300",
    COMPLETE: "bg-green-900 text-green-300",
    SUBMITTED: "bg-blue-900 text-blue-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-800 text-gray-300"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
