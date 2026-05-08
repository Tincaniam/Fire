import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";

export default async function ReportsPage() {
  const reports = await prisma.inspectionReport.findMany({
    orderBy: { inspectionDate: "desc" },
    include: {
      site: { include: { client: true } },
      technician: true,
      _count: { select: { deficiencies: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <Link
          href="/dashboard/reports/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
          <ClipboardList className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-medium">No reports yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Create your first inspection report.
          </p>
          <Link
            href="/dashboard/reports/new"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Report
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
                <th className="text-left px-4 py-3">Deficiencies</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
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
                    {r._count.deficiencies > 0 ? (
                      <span className="text-amber-400 font-medium">
                        {r._count.deficiencies}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/reports/${r.id}`}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      View →
                    </Link>
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
  const map: Record<string, string> = {
    DRAFT: "bg-gray-800 text-gray-300",
    COMPLETE: "bg-green-900 text-green-300",
    SUBMITTED: "bg-blue-900 text-blue-300",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        map[status] ?? "bg-gray-800 text-gray-300"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
