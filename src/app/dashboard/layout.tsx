import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getSessionUser } from "@/lib/session";

/** Convert a hex color to r,g,b components for alpha-composited CSS vars */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const primary = user.primaryColor ?? "#5e81ac";
  const accent = user.accentColor ?? "#88c0d0";
  const rgb = hexToRgb(primary);

  const cssVars = {
    "--brand-primary": primary,
    "--brand-accent": accent,
    "--brand-active-bg": `rgba(${rgb}, 0.12)`,
    "--brand-active-text": accent,
    "--brand-active-border": `rgba(${rgb}, 0.2)`,
  } as React.CSSProperties;

  return (
    <div className="flex h-screen bg-gray-950 text-white" style={cssVars}>
      <Sidebar
        user={{ name: user.name, email: user.email }}
        branding={{
          primaryColor: primary,
          accentColor: accent,
          companyName: user.companyName,
          logoUrl: user.logoUrl,
        }}
        role={user.role}
      />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

