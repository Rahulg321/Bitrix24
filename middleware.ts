import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  PROTECTED_BASE_ROUTES,
} from "@/routes";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = AUTH_ROUTES.includes(nextUrl.pathname);
  const isProtectedRoute =
    PROTECTED_ROUTES.includes(nextUrl.pathname) ||
    PROTECTED_BASE_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

    if (isProtectedRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
