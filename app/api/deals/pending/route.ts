import { auth } from "@/auth";
import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await redisClient.lrange("dealListings", 0, -1);
    const pending = raw
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      })
      .filter((d) => d && d.userId === userSession.user.id)
      .map(({ id, title, ebitda }) => ({
        id,
        title,
        ebitda,
        status: "Pending",
      }));

    console.log("pending items inside route", pending);

    return NextResponse.json(pending);
  } catch (error) {
    console.error("Error reading pending deals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
