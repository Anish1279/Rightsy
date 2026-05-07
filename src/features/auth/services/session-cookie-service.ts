import type { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/constants/auth";

const isProduction = process.env.NODE_ENV === "production";

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    path: "/api/auth",
    sameSite: "lax",
    secure: isProduction,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/api/auth",
    sameSite: "lax",
    secure: isProduction,
  });
}

export const setSessionCookie = (response: NextResponse, token: string): void => {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
};

export const clearSessionCookie = clearAuthCookies;
