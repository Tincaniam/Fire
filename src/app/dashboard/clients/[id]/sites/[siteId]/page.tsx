import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ClipboardList,
  Plus,
  ArrowRight,
  FileText,
  Pencil,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string; siteId: string }>;
}) {
  const { id: clientId, siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      client: true,
      reports: {
        orderBy: { inspectionDate: "desc" },
        include: {
          technician: true,
          _count: { select: { deficiencies: true } },
        },
      },
    },
  });

  if (!site || site.clientId !== clientId) notFound();

  const openDeficiencies = site.reports.reduce(
    (sum, r) => sum + r._count.deficiencies,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-1">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11.5px] text-gray-600 mb-2.5 flex items-center gap-1.5">
          <Link
            href="/dashboard/clients"
            className="hover:text-gray-400 transition-colors"
          >
            Clients
          </Link>
          <span className="text-gray-700">/</span>
          <Link
            href={`/dashboard/clients/${clientId}`}
            className="hover:text-gray-400 transition-colors"
          >
            {site.client.name}
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-500">{site.name}</span>
        </p>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              {site.name}
            </h1>
            <p className="text-gray-500 text-[13px] mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {site.address}
              {site.city ? `, ${site.city}` : ""}
              {site.state ? ` ${site.state}` : ""}
              {site.zip ? ` ${site.zip}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/clients/${clientId}?editSite=${siteId}`}
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-white border border-white/[0.08] bg-gray-800/60 hover:bg-gray-800 px-3 py-2 rounded-lg transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Site
            </Link>
            <Link
              href={`/dashboard/reports/new?siteId=${siteId}`}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_1px_10px_rgba(94,129,172,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              New Report
            </Link>
          </div>
        </div>
      </div>

      {/* Site info card */}
      <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl p-5">
        <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-4">
          Site Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-[13px]">
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">Reports</p>
            <p className="text-white font-semibold">{site.reports.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">Open Deficiencies</p>
            <p
              className={
                openDeficiencies > 0
                  ? "text-amber-400 font-semibold"
                  : "text-white font-semibold"
              }
            >
              {openDeficiencies}
            </p>
          </div>
          {site.city && (
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">City</p>
              <p className="text-white">{site.city}</p>
            </div>
          )}
          {site.state && (
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">State</p>
              <p className="text-white">{site.state}</p>
            </div>
          )}
          {site.zip && (
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">ZIP</p>
              <p className="text-white">{site.zip}</p>
            </div>
          )}
          {(site.client.phone || site.client.email) && (
            <div className="col-span-2">
              <p className="text-[11px] text-gray-500 mb-0.5">Client Contact</p>
              <p className="text-white">
                {site.client.contact ?? site.client.name}
                {site.client.phone ? (
                  <span className="text-gray-400 ml-2">{site.client.phone}</span>
                ) : null}
              </p>
            </div>
          )}
          {site.notes && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-[11px] text-gray-500 mb-0.5">Notes</p>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {site.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
            Reports ({site.reports.length})
          </h2>
          <Link
            href={`/dashboard/reports/new?siteId=${siteId}`}
            className="text-[12px] text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            New report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {site.reports.length === 0 ? (
          <div className="border border-dashed border-white/[0.07] rounded-xl p-10 text-center">
            <ClipboardList className="w-8 h-8 text-gray-700 mx-auto mb-2.5" />
            <p className="text-gray-400 text-[13.5px] font-medium">
              No reports yet
            </p>
            <Link
              href={`/dashboard/reports/new?siteId=${siteId}`}
              className="text-red-400 hover:text-red-300 text-[13px] mt-1 inline-flex items-center gap-1"
            >
              Create the first report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Technician
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
                {site.reports.map((r) => (
                  <tr
                    key={r.id}
                    className="group relative hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-medium text-white group-hover:text-red-400 transition-colors">
                      {r.serviceType.replace(/_/g, " ")}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(r.inspectionDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {r.technician.name ?? r.technician.email}
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
                        aria-label={`View report`}
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
