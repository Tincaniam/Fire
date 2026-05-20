import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

/** POST /api/companies/[id]/logo — upload company logo to Vercel Blob */
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

  const form = await req.formData();
  const file = form.get("logo") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use PNG, JPEG, SVG, or WebP." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 2 MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const blob = await put(`logos/company-${id}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const company = await prisma.company.update({
    where: { id },
    data: { logoUrl: blob.url },
  });

  return NextResponse.json({ logoUrl: company.logoUrl });
}
