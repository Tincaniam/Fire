import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientDetailClient from "./ClientDetailClient";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sites: {
        include: { _count: { select: { reports: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!client) notFound();

  return (
    <ClientDetailClient
      client={{
        id: client.id,
        name: client.name,
        contact: client.contact,
        email: client.email,
        phone: client.phone,
        address: client.address,
        notes: client.notes,
        sites: client.sites.map((s) => ({
          id: s.id,
          name: s.name,
          address: s.address,
          city: s.city,
          state: s.state,
          zip: s.zip,
          notes: s.notes,
          _count: s._count,
        })),
      }}
    />
  );
}
