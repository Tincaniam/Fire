"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Flame,
  LayoutDashboard,
  Building2,
  ClipboardList,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/clients", icon: Building2, label: "Clients & Sites" },
  { href: "/dashboard/reports", icon: ClipboardList, label: "Reports" },
];

export default function Sidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
        <div className="bg-red-600 p-1.5 rounded-lg">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-white text-sm leading-tight">
          FireExtenguisher
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-gray-800 px-4 py-4 space-y-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user.name ?? "User"}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
