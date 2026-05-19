import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Building2,
  MapPin,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [clientCount, siteCount, reportCount, openDeficiencies] =
    await Promise.all([
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-[13px] mt-0.5">
            Welcome back,{" "}
            <span className="text-gray-300">
              {session.user?.name?.split(" ")[0] ?? "there"}
            </span>
            .
          </p>
        </div>
        <Link
          href="/dashboard/reports/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_1px_10px_rgba(94,129,172,0.3)] hover:shadow-[0_1px_16px_rgba(94,129,172,0.4)]"
        >
          <Plus className="w-3.5 h-3.5" />
          New Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={clientCount}
          icon={Building2}
          iconClass="text-blue-400"
          iconBg="bg-blue-500/10"
          href="/dashboard/clients"
        />
        <StatCard
          label="Total Sites"
          value={siteCount}
          icon={MapPin}
          iconClass="text-violet-400"
          iconBg="bg-violet-500/10"
          href="/dashboard/clients"
        />
        <StatCard
          label="Reports"
          value={reportCount}
          icon={ClipboardList}
          iconClass="text-emerald-400"
          iconBg="bg-emerald-500/10"
          href="/dashboard/reports"
        />
        <StatCard
          label="Open Deficiencies"
          value={openDeficiencies}
          icon={AlertTriangle}
          iconClass={openDeficiencies > 0 ? "text-amber-400" : "text-gray-600"}
          iconBg={openDeficiencies > 0 ? "bg-amber-500/10" : "bg-gray-800/60"}
          href="/dashboard/reports"
          warn={openDeficiencies > 0}
        />
      </div>

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
            Recent Reports
          </h2>
          <Link
            href="/dashboard/reports"
            className="text-[12px] text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="border border-dashed border-white/[0.07] rounded-xl p-10 text-center">
            <ClipboardList className="w-8 h-8 text-gray-700 mx-auto mb-2.5" />
            <p className="text-gray-400 text-[13.5px] font-medium">
              No reports yet
            </p>
            <Link
              href="/dashboard/reports/new"
              className="text-red-400 hover:text-red-300 text-[13px] mt-1 inline-flex items-center gap-1"
            >
              Create your first report <ArrowRight className="w-3 h-3" />
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentReports.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/reports/${r.id}`}
                        className="group"
                      >
                        <span className="font-medium text-white group-hover:text-red-400 transition-colors">
                          {r.site.client.name}
                        </span>
                        <span className="text-gray-500"> · {r.site.name}</span>
                      </Link>
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

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  iconBg,
  href,
  warn,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  iconBg: string;
  href: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-gray-900/50 border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] hover:bg-gray-900/70 transition-all group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-[15px] h-[15px] ${iconClass}`} />
        </div>
        <span className="text-[11.5px] font-medium text-gray-500">{label}</span>
      </div>
      <p
        className={`text-[34px] font-bold leading-none tracking-tight ${
          warn ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </Link>
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

