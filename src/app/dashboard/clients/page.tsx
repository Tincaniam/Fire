import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, MapPin, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const where = isSuperAdmin(user) ? {} : { companyId: user.companyId! };
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { sites: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Clients &amp; Sites
          </h1>
          <p className="text-gray-500 text-[13px] mt-0.5">
            {clients.length > 0
              ? `${clients.length} client${clients.length !== 1 ? "s" : ""} total`
              : "Manage your client accounts"}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_1px_10px_rgba(94,129,172,0.25)]"
        >
          <Plus className="w-3.5 h-3.5" />
          New Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="border border-dashed border-white/[0.07] rounded-xl p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-white text-[14px] font-medium">No clients yet</p>
          <p className="text-gray-500 text-[13px] mt-1 mb-5">
            Add your first client to get started.
          </p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Client
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="flex items-center justify-between bg-gray-900/50 border border-white/[0.07] rounded-xl px-5 py-4 hover:border-white/[0.12] hover:bg-gray-900/70 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/[0.15] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-white group-hover:text-red-400 transition-colors">
                    {client.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[11.5px] text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {client._count.sites} site{client._count.sites !== 1 ? "s" : ""}
                    </span>
                    {client.address && (
                      <span className="text-[11.5px] text-gray-600">
                        {client.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
