// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getToken } from "next-auth/jwt";
import {
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
  PROTECTED_BASE_ROUTES,
  PROTECTED_ROUTES,
} from "./routes";

// ─── Upstash Redis REST client (Edge) ───────────────────────────────
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Define one Ratelimit instance per “task” ────────────────────────
const pageLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),    // 100 page‐views/min
});

const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),     // 60 general API calls/min
});

const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),     // 20 chat messages/min
});

const researchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),     // 10 research calls/min
});

const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),      // 5 uploads/min
});

export async function middleware(req: NextRequest) {
  // — Identify the client (by IP) —
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0] || "unknown";
  const path = req.nextUrl.pathname;

  // — Pick the right limiter based on path —
  let limiter = pageLimiter;
  if (path.startsWith("/api/chat")) {
    limiter = chatLimiter;
  } else if (path.startsWith("/api/research")) {
    limiter = researchLimiter;
  } else if (
    path.startsWith("/api/upload") ||
    path.startsWith("/api/bulk-upload")
  ) {
    limiter = uploadLimiter;
  } else if (path.startsWith("/api/")) {
    limiter = apiLimiter;
  }

  // — Apply rate limit —
  const { success, limit, remaining } = await limiter.limit(ip);
  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": process.env.RATE_LIMIT_WINDOW || "60",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  }

  // — Push headers on every successful pass —
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));

  // — Authentication / Protected‐route logic (unchanged) —
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  if (
    PROTECTED_BASE_ROUTES.some((r) => path.startsWith(r)) &&
    !isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (AUTH_ROUTES.includes(path) && isLoggedIn) {
    return NextResponse.redirect(
      new URL(DEFAULT_LOGIN_REDIRECT, req.url)
    );
  }

  if (PROTECTED_ROUTES.includes(path) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
