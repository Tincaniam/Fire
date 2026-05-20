import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  resolved: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (parsed.data.resolved !== undefined) {
    update.resolved = parsed.data.resolved;
    update.resolvedAt = parsed.data.resolved ? new Date() : null;
  }
  if ("dueDate" in parsed.data) {
    update.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  }

  const deficiency = await prisma.deficiency.update({ where: { id }, data: update });
  return NextResponse.json(deficiency);
}
