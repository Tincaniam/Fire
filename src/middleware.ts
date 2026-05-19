import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export default auth((req: NextRequest & { auth: unknown }) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isLandingPage = pathname === "/";

  if (!isLoggedIn && !isLoginPage && !isLandingPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && (isLoginPage || isLandingPage)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|portal).*)"],
};
