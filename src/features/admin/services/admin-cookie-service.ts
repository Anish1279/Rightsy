import type { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS, ADMIN_AUTH_COOKIE_NAME } from "@/constants/auth";

export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
