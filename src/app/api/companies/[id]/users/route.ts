import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { hash } from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["COMPANY_ADMIN", "TECHNICIAN"]).default("TECHNICIAN"),
});

/** GET /api/companies/[id]/users — list users in a company */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isSuperAdmin(user) && user.companyId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { companyId: id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

/** POST /api/companies/[id]/users — create a user and assign to company */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isSuperAdmin(user) && user.companyId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Company admins can only create technicians
  if (user.role === "COMPANY_ADMIN") {
    const body = await req.json();
    if (body.role && body.role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Company admins can only create technicians" }, { status: 403 });
    }
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  const newUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      companyId: id,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(newUser, { status: 201 });
}
