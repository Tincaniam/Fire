import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const report = await prisma.inspectionReport.findUnique({
    where: { id },
    include: {
      site: { include: { client: true } },
      technician: { select: { name: true } },
    },
  });

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = parsed.data;

  // Replace any existing token for this report
  await prisma.customerToken.deleteMany({ where: { reportId: id } });

  const token = crypto.randomUUID();
  await prisma.customerToken.create({
    data: { token, reportId: id, sentTo: email },
  });

  const origin = new URL(req.url).origin;
  const portalUrl = `${origin}/portal/${token}`;

  // Send email if Resend is configured
  if (resend) {
    const siteName = report.site.name;
    const clientName = report.site.client.name;
    const techName = report.technician?.name ?? "Your Inspector";
    const dateStr = new Date(report.inspectionDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const fromAddress =
      process.env.RESEND_FROM_EMAIL ?? "noreply@ravendock.com";

    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `Inspection Report Ready — ${siteName}`,
      html: buildEmailHtml({
        clientName,
        siteName,
        techName,
        dateStr,
        serviceType: report.serviceType,
        portalUrl,
      }),
    });
  }

  return NextResponse.json({ token, portalUrl });
}

function buildEmailHtml(opts: {
  clientName: string;
  siteName: string;
  techName: string;
  dateStr: string;
  serviceType: string;
  portalUrl: string;
}) {
  const { clientName, siteName, techName, dateStr, serviceType, portalUrl } =
    opts;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <div style="background:#2e3440;padding:28px 32px;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#eceff4;letter-spacing:-0.3px;">RavenDock</p>
      <p style="margin:4px 0 0;font-size:13px;color:#81a1c1;">Fire &amp; Life Safety Inspections</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Hi ${clientName},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
        Your inspection report for <strong>${siteName}</strong> is ready to view. 
        Click the button below to access your secure portal.
      </p>
      <table style="margin:0 0 28px;border:1px solid #e5e7eb;border-radius:6px;border-collapse:collapse;width:100%;">
        <tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;background:#f9fafb;border-bottom:1px solid #e5e7eb;width:40%;">Date</td><td style="padding:10px 16px;font-size:13px;color:#111;">${dateStr}</td></tr>
        <tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Service Type</td><td style="padding:10px 16px;font-size:13px;color:#111;">${serviceType}</td></tr>
        <tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;background:#f9fafb;">Technician</td><td style="padding:10px 16px;font-size:13px;color:#111;">${techName}</td></tr>
      </table>
      <a href="${portalUrl}" style="display:inline-block;background:#5e81ac;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:6px;">View Inspection Report →</a>
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
        Or copy this link: <a href="${portalUrl}" style="color:#5e81ac;word-break:break-all;">${portalUrl}</a>
      </p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© RavenDock. This link is unique to you — please do not share it.</p>
    </div>
  </div>
</body>
</html>`;
}
