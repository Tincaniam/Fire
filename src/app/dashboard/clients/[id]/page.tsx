import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, ClipboardList } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            <Link href="/dashboard/clients" className="hover:text-red-400">
              Clients
            </Link>{" "}
            / {client.name}
          </p>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          {client.address && (
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {client.address}
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/clients/${id}/sites/new`}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Site
        </Link>
      </div>

      {/* Contact info */}
      {(client.contact || client.email || client.phone) && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-wrap gap-6 text-sm">
          {client.contact && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Contact</p>
              <p className="text-white">{client.contact}</p>
            </div>
          )}
          {client.email && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Email</p>
              <a href={`mailto:${client.email}`} className="text-red-400 hover:text-red-300">
                {client.email}
              </a>
            </div>
          )}
          {client.phone && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Phone</p>
              <a href={`tel:${client.phone}`} className="text-red-400 hover:text-red-300">
                {client.phone}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Sites */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Sites ({client.sites.length})
        </h2>
        {client.sites.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-8 text-center">
            <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No sites yet.</p>
            <Link
              href={`/dashboard/clients/${id}/sites/new`}
              className="text-red-400 hover:text-red-300 text-sm mt-1 inline-block"
            >
              Add the first site →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {client.sites.map((site) => (
              <Link
                key={site.id}
                href={`/dashboard/clients/${id}/sites/${site.id}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 hover:border-gray-700 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-white group-hover:text-red-400 transition-colors">
                    {site.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {site.address}
                    {site.city ? `, ${site.city}` : ""}
                    {site.state ? ` ${site.state}` : ""}
                    {" · "}
                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      {site._count.reports} report{site._count.reports !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/dashboard/reports/new?siteId=${site.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 pr-2"
                >
                  <Plus className="w-3 h-3" />
                  New Report
                </Link>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
