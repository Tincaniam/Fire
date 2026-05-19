import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  CalendarDays,
  User,
  MapPin,
} from "lucide-react";
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
  const total = report.lineItems.length;
  const passPercent = total > 0 ? Math.round((passCount / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-1">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11.5px] text-gray-600 mb-2.5 flex items-center gap-1.5">
          <Link
            href="/dashboard/reports"
            className="hover:text-gray-400 transition-colors"
          >
            Reports
          </Link>
          <span className="text-gray-700">/</span>
          <Link
            href={`/dashboard/clients/${report.site.client.id}`}
            className="hover:text-gray-400 transition-colors"
          >
            {report.site.client.name}
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-500">{report.site.name}</span>
        </p>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] font-bold text-white tracking-tight">
                {report.serviceType.replace(/_/g, " ")} Inspection
              </h1>
              <StatusBadge status={report.status} />
            </div>
            <div className="flex items-center gap-5 text-[12.5px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-gray-600" />
                {new Date(report.inspectionDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-600" />
                {report.technician.name ?? report.technician.email}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-600" />
                {report.site.name}
              </span>
            </div>
          </div>
          <ReportActions reportId={report.id} status={report.status} />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl p-5">
        <div className="grid grid-cols-4 gap-5">
          <SummaryCard
            label="Pass"
            value={passCount}
            valueClass="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <SummaryCard
            label="Fail"
            value={failCount}
            valueClass="text-[#bf616a]"
            bg="bg-[#bf616a]/15"
          />
          <SummaryCard
            label="N/A"
            value={naCount}
            valueClass="text-gray-400"
            bg="bg-gray-700/30"
          />
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
              Pass Rate
            </p>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${passPercent}%` }}
                />
              </div>
              <span className="text-[13px] font-bold text-white tabular-nums">
                {passPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[13.5px] font-semibold text-white">
            Inspection Checklist
          </h2>
          <p className="text-[11.5px] text-gray-500 mt-0.5">
            {total} items · {passCount} passed · {failCount} failed
          </p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {report.lineItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3.5 px-5 py-3.5">
              <ResultIcon result={item.result} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-white">{item.label}</p>
                {item.notes && (
                  <p className="text-[11.5px] text-gray-500 mt-0.5">
                    {item.notes}
                  </p>
                )}
              </div>
              <ResultBadge result={item.result} />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {report.notes && (
        <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl px-5 py-4">
          <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
            Notes
          </h2>
          <p className="text-[13px] text-gray-300 whitespace-pre-wrap leading-relaxed">
            {report.notes}
          </p>
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

function SummaryCard({
  label,
  value,
  valueClass,
  bg,
}: {
  label: string;
  value: number;
  valueClass: string;
  bg: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
        {label}
      </p>
      <div
        className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg}`}
      >
        <span className={`text-[22px] font-bold ${valueClass}`}>{value}</span>
      </div>
    </div>
  );
}

function ResultIcon({ result }: { result: string }) {
  if (result === "PASS")
    return (
      <CheckCircle className="w-[17px] h-[17px] text-emerald-400 shrink-0 mt-0.5" />
    );
  if (result === "FAIL")
    return (
      <XCircle className="w-[17px] h-[17px] text-[#bf616a] shrink-0 mt-0.5" />
    );
  return (
    <MinusCircle className="w-[17px] h-[17px] text-gray-600 shrink-0 mt-0.5" />
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "PASS")
    return (
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
        Pass
      </span>
    );
  if (result === "FAIL")
    return (
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#bf616a]/15 text-[#bf616a]">
        Fail
      </span>
    );
  return (
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-500">
      N/A
    </span>
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

