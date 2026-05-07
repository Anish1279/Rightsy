import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE_NAME, ADMIN_AUTH_COOKIE_NAME } from "@/constants/auth";
import { verifyAdminToken } from "@/features/admin/services/admin-auth-service";
import { verifyAccessToken } from "@/features/auth/services/token-service";

const PROTECTED_ROUTES = ["/dashboard", "/forum"];
const ADMIN_PROTECTED_ROUTES = ["/govtadmin/database"];
const AUTH_ROUTES = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

function startsWithAny(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const verifiedToken = await verifyAccessToken(token);

  if (startsWithAny(pathname, PROTECTED_ROUTES)) {
    if (!verifiedToken) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/sign-in", request.url)));
    }
  }

  if (startsWithAny(pathname, ADMIN_PROTECTED_ROUTES)) {
    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
    const verifiedAdmin = await verifyAdminToken(adminToken);

    if (!verifiedAdmin && verifiedToken?.role !== "ADMIN") {
      return withSecurityHeaders(NextResponse.redirect(new URL("/govtadmin", request.url)));
    }
  }

  if (verifiedToken && startsWithAny(pathname, AUTH_ROUTES)) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
