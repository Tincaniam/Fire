import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, MinusCircle, CalendarDays, User, MapPin, FileDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const record = await prisma.customerToken.findUnique({
    where: { token },
    include: {
      report: {
        include: {
          site: { include: { client: true } },
          technician: { select: { name: true, email: true } },
          lineItems: { orderBy: { sortOrder: "asc" } },
          deficiencies: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!record) notFound();

  const { report } = record;

  const passCount = report.lineItems.filter((i) => i.result === "PASS").length;
  const failCount = report.lineItems.filter((i) => i.result === "FAIL").length;
  const naCount = report.lineItems.filter((i) => i.result === "NA").length;
  const total = report.lineItems.length;
  const passPercent = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const dateStr = new Date(report.inspectionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const techName =
    report.technician?.name ?? report.technician?.email ?? "Inspector";

  const openDeficiencies = report.deficiencies.filter((d) => !d.resolved);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-white/[0.07] bg-gray-900">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-white tracking-tight">
              RavenDock
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Fire &amp; Life Safety Inspections
            </p>
          </div>
          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12.5px] font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF
            </a>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-6">
        {/* Report title */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              {report.serviceType.replace(/_/g, " ")} Inspection
            </h1>
            <StatusBadge status={report.status} />
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[12.5px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-gray-600" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-600" />
              {techName}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-600" />
              {report.site.name}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-900/50 border border-white/[0.07] rounded-xl p-5">
          <div className="grid grid-cols-4 gap-5">
            <SummaryCard label="Pass" value={passCount} valueClass="text-emerald-400" bg="bg-emerald-500/10" />
            <SummaryCard label="Fail" value={failCount} valueClass="text-[#bf616a]" bg="bg-[#bf616a]/15" />
            <SummaryCard label="N/A" value={naCount} valueClass="text-gray-400" bg="bg-gray-700/30" />
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                Pass Rate
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
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

        {/* Open Deficiencies banner */}
        {openDeficiencies.length > 0 && (
          <div className="bg-[#bf616a]/10 border border-[#bf616a]/25 rounded-xl px-5 py-4">
            <p className="text-[12.5px] font-semibold text-[#bf616a] mb-1">
              {openDeficiencies.length} Open{" "}
              {openDeficiencies.length === 1 ? "Deficiency" : "Deficiencies"}
            </p>
            <ul className="space-y-1">
              {openDeficiencies.map((d) => (
                <li key={d.id} className="flex items-start gap-2 text-[12.5px] text-gray-400">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: severityColor(d.severity) }}
                  />
                  <span>{d.description}</span>
                  <span className="ml-auto shrink-0 text-[11px] font-medium" style={{ color: severityColor(d.severity) }}>
                    {d.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checklist */}
        {total > 0 && (
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
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 px-5 py-3.5"
                >
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
        )}

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
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-5 py-8">
        <p className="text-[11.5px] text-gray-700 text-center">
          This report was shared with you securely by{" "}
          <span className="text-gray-600">{report.site.client.name}</span> via
          RavenDock. &copy; {new Date().getFullYear()} RavenDock.
        </p>
      </footer>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-amber-500/15 text-amber-400",
    COMPLETE: "bg-emerald-500/10 text-emerald-400",
    SUBMITTED: "bg-red-500/15 text-red-400",
  };
  const label: Record<string, string> = {
    DRAFT: "Draft",
    COMPLETE: "Complete",
    SUBMITTED: "Submitted",
  };
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-gray-700/30 text-gray-400"}`}
    >
      {label[status] ?? status}
    </span>
  );
}

function SummaryCard({ label, value, valueClass, bg }: {
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
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg}`}>
        <span className={`text-[22px] font-bold ${valueClass}`}>{value}</span>
      </div>
    </div>
  );
}

function ResultIcon({ result }: { result: string }) {
  if (result === "PASS")
    return <CheckCircle className="w-[17px] h-[17px] text-emerald-400 shrink-0 mt-0.5" />;
  if (result === "FAIL")
    return <XCircle className="w-[17px] h-[17px] text-[#bf616a] shrink-0 mt-0.5" />;
  return <MinusCircle className="w-[17px] h-[17px] text-gray-600 shrink-0 mt-0.5" />;
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
    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-700/30 text-gray-400">
      N/A
    </span>
  );
}

function severityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL": return "#bf616a";
    case "HIGH": return "#d08770";
    case "MODERATE": return "#ebcb8b";
    case "LOW": return "#a3be8c";
    default: return "#81a1c1";
  }
}
