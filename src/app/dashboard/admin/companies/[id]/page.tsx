import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import CompanyEditForm from "./CompanyEditForm";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  const { id } = await params;

  if (!user) redirect("/login");
  if (!isSuperAdmin(user) && user.companyId !== id) redirect("/dashboard");

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
      },
      _count: { select: { clients: true } },
    },
  });
  if (!company) notFound();

  return (
    <CompanyEditForm
      company={company}
      isSuperAdmin={isSuperAdmin(user)}
    />
  );
}
