import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ClipboardList, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const companyWhere = isSuperAdmin(user)
    ? undefined
    : { site: { client: { companyId: user.companyId! } } };

  const reports = await prisma.inspectionReport.findMany({
    where: companyWhere,
    orderBy: { inspectionDate: "desc" },
    include: {
      site: { include: { client: true } },
      technician: true,
      _count: { select: { deficiencies: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Reports
          </h1>
          <p className="text-gray-500 text-[13px] mt-0.5">
            {reports.length > 0
              ? `${reports.length} inspection report${
                  reports.length !== 1 ? "s" : ""
                }`
              : "Create and manage inspection reports"}
          </p>
        </div>
        <Link
          href="/dashboard/reports/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_1px_10px_rgba(94,129,172,0.25)]"
        >
          <Plus className="w-3.5 h-3.5" />
          New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="border border-dashed border-white/[0.07] rounded-xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-white text-[14px] font-medium">No reports yet</p>
          <p className="text-gray-500 text-[13px] mt-1 mb-5">
            Create your first inspection report.
          </p>
          <Link
            href="/dashboard/reports/new"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Report
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Client / Site
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Deficiencies
                </th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="group relative hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-white group-hover:text-red-400 transition-colors">
                      {r.site.client.name}
                    </span>
                    <span className="text-gray-500"> · {r.site.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">
                    {r.serviceType.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(r.inspectionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    {r._count.deficiencies > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {r._count.deficiencies}
                      </span>
                    ) : (
                      <span className="text-gray-700 text-[12px]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/dashboard/reports/${r.id}`}
                      className="absolute inset-0"
                      aria-label={`View report for ${r.site.client.name} — ${r.site.name}`}
                    />
                    <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    DRAFT: { bg: "bg-gray-800/80", text: "text-gray-400", dot: "bg-gray-500" },
    COMPLETE: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      dot: "bg-emerald-500",
    },
    SUBMITTED: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      dot: "bg-blue-500",
    },
  };
  const c = config[status] ?? config.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
