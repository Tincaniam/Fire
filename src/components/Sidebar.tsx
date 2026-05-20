"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  LogOut,
  Shield,
} from "lucide-react";
import RavenIcon from "@/components/RavenIcon";
import { cn } from "@/lib/utils";

const coreNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Building2, label: "Clients & Sites" },
  { href: "/dashboard/reports", icon: ClipboardList, label: "Reports" },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

type Branding = {
  primaryColor: string;
  accentColor: string;
  companyName: string | null;
  logoUrl: string | null;
};

export default function Sidebar({
  user,
  branding,
  role,
  companyId,
}: {
  user: { name?: string | null; email?: string | null };
  branding?: Branding;
  role?: string;
  companyId?: string | null;
}) {
  const pathname = usePathname();
  const primary = branding?.primaryColor ?? "#5e81ac";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isCompanyAdmin = role === "COMPANY_ADMIN";

  return (
    <aside className="w-[220px] shrink-0 bg-[#2e3440] border-r border-white/[0.05] flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[56px] border-b border-white/[0.05] shrink-0">
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden shadow-[0_0_14px_rgba(94,129,172,0.5)]"
          style={{ backgroundColor: primary }}
        >
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt=""
              aria-hidden="true"
              className="w-[46px] h-[46px] object-contain"
            />
          ) : (
            <RavenIcon className="w-[46px] h-[46px] text-white" />
          )}
        </div>
        <span className="font-semibold text-[13.5px] text-white tracking-tight">
          {branding?.companyName ?? "RavenDock"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 pt-4 pb-2 space-y-[2px]">
        <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600">
          Menu
        </p>
        {coreNav.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-[var(--brand-active-bg)] text-[var(--brand-active-text)] border border-[var(--brand-active-border)]"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-[15px] h-[15px] shrink-0",
                  active ? "text-[var(--brand-active-text)]" : "text-gray-500"
                )}
              />
              {label}
            </Link>
          );
        })}

        {isSuperAdmin && (
          <>
            <p className="px-2.5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600">
              Admin
            </p>
            <Link
              href="/dashboard/admin/companies"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
                pathname.startsWith("/dashboard/admin")
                  ? "bg-[var(--brand-active-bg)] text-[var(--brand-active-text)] border border-[var(--brand-active-border)]"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 border border-transparent"
              )}
            >
              <Shield
                className={cn(
                  "w-[15px] h-[15px] shrink-0",
                  pathname.startsWith("/dashboard/admin")
                    ? "text-[var(--brand-active-text)]"
                    : "text-gray-500"
                )}
              />
              Companies
            </Link>
          </>
        )}

        {isCompanyAdmin && companyId && (
          <>
            <p className="px-2.5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600">
              Admin
            </p>
            <Link
              href={`/dashboard/admin/companies/${companyId}`}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
                pathname.startsWith("/dashboard/admin")
                  ? "bg-[var(--brand-active-bg)] text-[var(--brand-active-text)] border border-[var(--brand-active-border)]"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 border border-transparent"
              )}
            >
              <Shield
                className={cn(
                  "w-[15px] h-[15px] shrink-0",
                  pathname.startsWith("/dashboard/admin")
                    ? "text-[var(--brand-active-text)]"
                    : "text-gray-500"
                )}
              />
              Team & Settings
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.05] p-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(94,129,172,0.4)]"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${branding?.accentColor ?? "#8fbcbb"})`,
            }}
          >
            <span className="text-[11px] font-bold text-white leading-none">
              {getInitials(user.name, user.email)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate leading-[1.3]">
              {user.name ?? "User"}
            </p>
            <p className="text-[11px] text-gray-500 truncate leading-[1.3]">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[12px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}


