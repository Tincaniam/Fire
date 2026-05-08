import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { InspectionReportPDF } from "@/components/pdf/InspectionReportPDF";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(InspectionReportPDF({ report }));

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="inspection-report-${id}.pdf"`,
    },
  });
}
