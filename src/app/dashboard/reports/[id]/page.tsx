import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, MinusCircle, AlertTriangle } from "lucide-react";
import DeficiencyPanel from "./DeficiencyPanel";
import ReportActions from "./ReportActions";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.inspectionReport.findUnique({
    where: { id },
    include: {
      site: { include: { client: true } },
      technician: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      deficiencies: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) notFound();

  const passCount = report.lineItems.filter((i) => i.result === "PASS").length;
  const failCount = report.lineItems.filter((i) => i.result === "FAIL").length;
  const naCount = report.lineItems.filter((i) => i.result === "NA").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            <Link href="/dashboard/reports" className="hover:text-red-400">
              Reports
            </Link>{" "}
            /{" "}
            <Link
              href={`/dashboard/clients/${report.site.client.id}`}
              className="hover:text-red-400"
            >
              {report.site.client.name}
            </Link>{" "}
            / {report.site.name}
          </p>
          <h1 className="text-2xl font-bold text-white">
            {report.serviceType.replace(/_/g, " ")} Inspection
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date(report.inspectionDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {report.technician.name ?? report.technician.email}
          </p>
        </div>
        <ReportActions reportId={report.id} status={report.status} />
      </div>

      {/* Status + summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <StatusBadge status={report.status} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Pass</p>
          <p className="text-xl font-bold text-green-400">{passCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Fail</p>
          <p className="text-xl font-bold text-red-400">{failCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">N/A</p>
          <p className="text-xl font-bold text-gray-400">{naCount}</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">Inspection Checklist</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {report.lineItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3">
              <ResultIcon result={item.result} />
              <div className="flex-1">
                <p className="text-sm text-white">{item.label}</p>
                {item.notes && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
                )}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  item.result === "PASS"
                    ? "bg-green-900 text-green-300"
                    : item.result === "FAIL"
                    ? "bg-red-900 text-red-300"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {item.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {report.notes && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Notes
          </h2>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{report.notes}</p>
        </div>
      )}

      {/* Deficiencies */}
      <DeficiencyPanel
        reportId={report.id}
        deficiencies={report.deficiencies}
      />
    </div>
  );
}

function ResultIcon({ result }: { result: string }) {
  if (result === "PASS") return <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />;
  if (result === "FAIL") return <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
  return <MinusCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-gray-800 text-gray-300",
    COMPLETE: "bg-green-900 text-green-300",
    SUBMITTED: "bg-blue-900 text-blue-300",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        map[status] ?? "bg-gray-800 text-gray-300"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
