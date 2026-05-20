import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import ReportsTable from "./ReportsTable";

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
        <ReportsTable reports={reports} />
      )}
    </div>
  );
}
