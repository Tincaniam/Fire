import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, companyFilter, isSuperAdmin } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: companyFilter(user),
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdmin(user) && !user.companyId) {
    return NextResponse.json({ error: "No company assigned" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const companyId = isSuperAdmin(user) ? (body.companyId as string | undefined) : user.companyId!;
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const client = await prisma.client.create({ data: { ...parsed.data, companyId } });
  return NextResponse.json(client, { status: 201 });
}
