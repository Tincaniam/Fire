import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { renderToBuffer } from "@react-pdf/renderer";
import { InspectionReportPDF } from "@/components/pdf/InspectionReportPDF";
import { put } from "@vercel/blob";

async function fetchReport(id: string) {
  return prisma.inspectionReport.findUnique({
    where: { id },
    include: {
      site: { include: { client: true } },
      technician: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      deficiencies: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await fetchReport(id);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(
    InspectionReportPDF({
      report,
      companyName: user.companyName ?? "RavenDock",
      primaryColor: user.primaryColor ?? "#5e81ac",
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="inspection-report-${id}.pdf"`,
    },
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await fetchReport(id);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = await renderToBuffer(
    InspectionReportPDF({
      report,
      companyName: user.companyName ?? "RavenDock",
      primaryColor: user.primaryColor ?? "#5e81ac",
    })
  );

  const blob = await put(`reports/${id}.pdf`, buffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });

  const updated = await prisma.inspectionReport.update({
    where: { id },
    data: { pdfUrl: blob.url },
  });

  return NextResponse.json({ url: updated.pdfUrl });
}
