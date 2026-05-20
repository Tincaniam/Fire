import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });
        if (!user) return null;

        const passwordMatch = await compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId ?? null,
          companyName: user.company?.name ?? null,
          primaryColor: user.company?.primaryColor ?? "#5e81ac",
          accentColor: user.company?.accentColor ?? "#88c0d0",
          logoUrl: user.company?.logoUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string;
          role: string;
          companyId: string | null;
          companyName: string | null;
          primaryColor: string;
          accentColor: string;
          logoUrl: string | null;
        };
        token.id = u.id;
        token.role = u.role;
        token.companyId = u.companyId;
        token.companyName = u.companyName;
        token.primaryColor = u.primaryColor;
        token.accentColor = u.accentColor;
        token.logoUrl = u.logoUrl;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      const u = session.user as unknown as Record<string, unknown>;
      u.role = token.role;
      u.companyId = token.companyId;
      u.companyName = token.companyName;
      u.primaryColor = token.primaryColor;
      u.accentColor = token.accentColor;
      u.logoUrl = token.logoUrl;
      return session;
    },
  },
});
