import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  companyId: string | null;
  companyName: string | null;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as Record<string, unknown>;
  return {
    id: u.id as string,
    name: (session.user.name as string | null | undefined) ?? null,
    email: (session.user.email as string | null | undefined) ?? null,
    role: u.role as string,
    companyId: (u.companyId as string | null) ?? null,
    companyName: (u.companyName as string | null) ?? null,
    primaryColor: (u.primaryColor as string) ?? "#5e81ac",
    accentColor: (u.accentColor as string) ?? "#88c0d0",
    logoUrl: (u.logoUrl as string | null) ?? null,
  };
}

export function isSuperAdmin(user: SessionUser) {
  return user.role === "SUPER_ADMIN";
}

/** Returns a Prisma `where` fragment to scope by company, or {} for super admin */
export function companyFilter(user: SessionUser) {
  if (isSuperAdmin(user)) return {};
  return { companyId: user.companyId! };
}
