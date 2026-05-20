import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, clients: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const company = await prisma.company.create({ data: parsed.data });
  return NextResponse.json(company, { status: 201 });
}
