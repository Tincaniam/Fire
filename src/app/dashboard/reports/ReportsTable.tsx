"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

type Report = {
  id: string;
  serviceType: string;
  inspectionDate: Date;
  status: string;
  site: { name: string; client: { name: string } };
  _count: { deficiencies: number };
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    DRAFT: { bg: "bg-gray-800/80", text: "text-gray-400", dot: "bg-gray-500" },
    COMPLETE: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    SUBMITTED: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  };
  const c = config[status] ?? config.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function ReportsTable({ reports }: { reports: Report[] }) {
  const router = useRouter();

  return (
    <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Client / Site</th>
            <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Type</th>
            <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Date</th>
            <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Deficiencies</th>
            <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {reports.map((r) => (
            <tr
              key={r.id}
              onClick={() => router.push(`/dashboard/reports/${r.id}`)}
              className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
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
                <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
