import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const target = await request.json();

  console.log("URL:", target.url, "FirmName:", target.firmName);
  await redisClient.connect();

  try {
    const fullTarget = {
      ...target,
      userId: 42,
    };
    await redisClient.lPush("submissions", JSON.stringify(fullTarget));
  } catch (error) {
    console.error("Error pushing to Redis", error);
    return NextResponse.json({message: "Error pushing to Redis"});
  }

  return NextResponse.json({
    message: "Scraping task successfully pushed on to the backend",
  });
}
