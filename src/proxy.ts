import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE_NAME, AUTH_COOKIE_NAME } from "@/constants/auth";
import { verifyAdminToken } from "@/features/admin/services/admin-auth-service";
import { verifyAuthToken } from "@/features/auth/services/token-service";

const PROTECTED_ROUTES = ["/dashboard", "/forum"];
const ADMIN_PROTECTED_ROUTES = ["/govtadmin/database"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

function startsWithAny(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (startsWithAny(pathname, PROTECTED_ROUTES)) {
    const verifiedToken = token ? await verifyAuthToken(token) : null;

    if (!verifiedToken) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (startsWithAny(pathname, ADMIN_PROTECTED_ROUTES)) {
    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
    const verifiedAdmin = await verifyAdminToken(adminToken);

    if (!verifiedAdmin) {
      return NextResponse.redirect(new URL("/govtadmin", request.url));
    }
  }

  if (token && startsWithAny(pathname, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
