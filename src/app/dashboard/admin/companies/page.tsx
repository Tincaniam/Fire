import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isSuperAdmin } from "@/lib/session";
import Link from "next/link";
import { Plus, Building2, Users, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) redirect("/dashboard");

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, clients: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Companies</h1>
          <p className="text-gray-500 text-[13px] mt-0.5">
            {companies.length > 0
              ? `${companies.length} compan${companies.length !== 1 ? "ies" : "y"} onboarded`
              : "Onboard your first company"}
          </p>
        </div>
        <Link
          href="/dashboard/admin/companies/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_1px_10px_rgba(94,129,172,0.25)]"
        >
          <Plus className="w-3.5 h-3.5" />
          New Company
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="border border-dashed border-white/[0.07] rounded-xl p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-white text-[14px] font-medium">No companies yet</p>
          <p className="text-gray-500 text-[13px] mt-1 mb-5">
            Create a company to onboard your first customer.
          </p>
          <Link
            href="/dashboard/admin/companies/new"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Company
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/dashboard/admin/companies/${company.id}`}
              className="flex items-center justify-between bg-gray-900/50 border border-white/[0.07] rounded-xl px-5 py-4 hover:border-white/[0.12] hover:bg-gray-900/70 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-gray-800 flex items-center justify-center">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: company.primaryColor }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-white text-[14px] font-semibold">{company.name}</p>
                  <p className="text-gray-500 text-[12px] mt-0.5">
                    {company._count.users} user{company._count.users !== 1 ? "s" : ""} &middot;{" "}
                    {company._count.clients} client{company._count.clients !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-white/10"
                    style={{ backgroundColor: company.primaryColor }}
                  />
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-white/10"
                    style={{ backgroundColor: company.accentColor }}
                  />
                </div>
                <Users className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
