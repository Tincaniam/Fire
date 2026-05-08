import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Building2, ChevronRight } from "lucide-react";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { sites: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clients & Sites</h1>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-medium">No clients yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Add your first client to get started.</p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 hover:border-gray-700 transition-colors group"
            >
              <div>
                <p className="font-semibold text-white group-hover:text-red-400 transition-colors">
                  {client.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {client._count.sites} site{client._count.sites !== 1 ? "s" : ""}
                  {client.address ? ` · ${client.address}` : ""}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
