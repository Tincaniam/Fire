import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { z } from "zod";

const SERVICE_TYPES = [
  "FIRE_EXTINGUISHER",
  "SPRINKLER",
  "FIRE_ALARM",
  "SUPPRESSION_SYSTEM",
  "BACKFLOW",
  "OTHER",
] as const;

const schema = z.object({
  siteId: z.string().min(1),
  technicianId: z.string().min(1),
  inspectionDate: z.string().min(1),
  serviceType: z.enum(SERVICE_TYPES),
  notes: z.string().optional(),
  lineItems: z.array(
    z.object({
      label: z.string().min(1),
      result: z.enum(["PASS", "FAIL", "NA"]),
      notes: z.string().optional(),
    })
  ),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companyWhere = isSuperAdmin(user)
    ? undefined
    : { site: { client: { companyId: user.companyId! } } };

  const reports = await prisma.inspectionReport.findMany({
    where: companyWhere,
    orderBy: { inspectionDate: "desc" },
    include: { site: { include: { client: true } }, technician: true },
  });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { lineItems, ...rest } = parsed.data;

  const report = await prisma.inspectionReport.create({
    data: {
      ...rest,
      inspectionDate: new Date(rest.inspectionDate),
      lineItems: {
        create: lineItems.map((item, i) => ({ ...item, sortOrder: i })),
      },
    },
  });

  return NextResponse.json(report, { status: 201 });
}
