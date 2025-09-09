import { rateLimit } from "@/lib/redis";

export async function GET(request: Request) {
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

  return new Response("Hello World");
}
