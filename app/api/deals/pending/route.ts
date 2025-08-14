import { auth } from "@/auth";
import { getRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

interface RedisDealListing {
  id: string;
  title: string;
  ebitda: number;
  userId: string;
}

export async function GET() {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redisClient = await getRedisClient();
    if (!redisClient.isOpen) await redisClient.connect();
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    const raw = await (await getRedisClient()).lRange("dealListings", 0, -1);

    // parse and filter by this user with typing
    const all: RedisDealListing[] = raw
      .map((s: string) => {
        try {
          return JSON.parse(s) as RedisDealListing;
        } catch {
          return null;
        }
      })
      .filter((d: RedisDealListing | null): d is RedisDealListing => !!d)
      .filter((d: RedisDealListing) => d.userId === userSession.user.id);

    // map to response shape
    const pending = all.map((d: RedisDealListing) => ({
      id: d.id,
      title: d.title,
      ebitda: d.ebitda,
      status: "Pending" as const,
    }));

    console.log("pending", pending);

    return NextResponse.json(pending);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
