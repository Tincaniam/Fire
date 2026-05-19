import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import EditReportForm from "./EditReportForm";

export const dynamic = "force-dynamic";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [report, users] = await Promise.all([
    prisma.inspectionReport.findUnique({
      where: { id },
      include: {
        site: { include: { client: true } },
        lineItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  if (!report) notFound();
  if (report.status !== "DRAFT") redirect(`/dashboard/reports/${id}`);

  const defaultValues = {
    serviceType: report.serviceType as
      | "FIRE_EXTINGUISHER"
      | "SPRINKLER"
      | "FIRE_ALARM"
      | "SUPPRESSION_SYSTEM"
      | "BACKFLOW"
      | "OTHER",
    inspectionDate: report.inspectionDate.toISOString().split("T")[0],
    technicianId: report.technicianId,
    notes: report.notes ?? "",
    lineItems: report.lineItems.map((item) => ({
      label: item.label,
      result: item.result as "PASS" | "FAIL" | "NA",
      notes: item.notes ?? "",
    })),
  };

  const userList = users.map((u) => ({ id: u.id, name: u.name ?? u.email }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-1">
      {/* Breadcrumb */}
      <div>
        <p className="text-[11.5px] text-gray-600 mb-2.5 flex items-center gap-1.5">
          <Link href="/dashboard/reports" className="hover:text-gray-400 transition-colors">
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
          <Link
            href={`/dashboard/reports/${id}`}
            className="hover:text-gray-400 transition-colors"
          >
            {report.serviceType.replace(/_/g, " ")} Inspection
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-500">Edit</span>
        </p>

        <h1 className="text-[22px] font-bold text-white tracking-tight">
          Edit Draft Report
        </h1>
        <p className="text-gray-500 text-[13px] mt-0.5">
          {report.site.client.name} · {report.site.name}
        </p>
      </div>

      <EditReportForm
        reportId={id}
        users={userList}
        defaultValues={defaultValues}
      />
    </div>
  );
}
