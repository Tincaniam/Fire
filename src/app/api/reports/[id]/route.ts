import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
  status: z.enum(["DRAFT", "COMPLETE", "SUBMITTED"]).optional(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  inspectionDate: z.string().optional(),
  technicianId: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  lineItems: z
    .array(
      z.object({
        label: z.string().min(1),
        result: z.enum(["PASS", "FAIL", "NA"]),
        notes: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { lineItems, inspectionDate, ...reportFields } = parsed.data;

  const updateData: Record<string, unknown> = { ...reportFields };
  if (inspectionDate) updateData.inspectionDate = new Date(inspectionDate);

  if (lineItems) {
    // Replace all line items in a transaction
    const report = await prisma.$transaction(async (tx) => {
      await tx.inspectionItem.deleteMany({ where: { reportId: id } });
      return tx.inspectionReport.update({
        where: { id },
        data: {
          ...updateData,
          lineItems: {
            create: lineItems.map((item, idx) => ({
              label: item.label,
              result: item.result as "PASS" | "FAIL" | "NA",
              notes: item.notes ?? null,
              sortOrder: item.sortOrder ?? idx,
            })),
          },
        },
      });
    });
    return NextResponse.json(report);
  }

  const report = await prisma.inspectionReport.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(report);
}
