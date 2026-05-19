import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  reportId: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]).default("MODERATE"),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { dueDate, ...rest } = parsed.data;
  const deficiency = await prisma.deficiency.create({
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : null },
  });
  return NextResponse.json(deficiency, { status: 201 });
}
