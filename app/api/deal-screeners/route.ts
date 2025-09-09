import { auth } from "@/auth";
import { getAllScreenersWithContent } from "@/lib/queries";
import { rateLimit } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userSession = await auth();

  if (!userSession) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { ok, remaining, reset } = await rateLimit(
    `api:sample-route:${ip}`,
    10, // 10 requests per minute
    60_000, // 1 minute
  );

  if (!ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "RateLimit-Limit": "10",
        "RateLimit-Remaining": String(remaining),
        "RateLimit-Reset": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  try {
    const screeners = await getAllScreenersWithContent();

    if (!screeners) {
      return new Response("No screeners found", { status: 404 });
    }

    return NextResponse.json(screeners);
  } catch (error) {
    console.error("Error fetching deal screeners", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
