import { auth } from "@/auth";
import { getRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 400,
      },
    );
  }

  const { dealListings } = await request.json();
  console.log("inside api route");
  console.log(dealListings);

  try {
    console.log("connecting to redis");
    const redisClient = await getRedisClient();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log("connected to redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    console.log("pushing all the deals to bitrix");

    const redisClient = await getRedisClient();
    dealListings.forEach(async (dealListing: any) => {
      const dealListingWithUserId = {
        ...dealListing,
        userId: userSession.user.id,
      };

      await redisClient.lPush(
        "dealListings",
        JSON.stringify(dealListingWithUserId),
      );
    });

    // publish the message that a new screening call request was made
    await (await getRedisClient()).publish(
      "new_screen_call",
      JSON.stringify({
        userId: userSession.user.id,
      }),
    );
  } catch (error) {
    console.error("Error pushing to Redis:", error);
    return NextResponse.json({ message: "Error pushing to Redis" });
  }

  return NextResponse.json({
    message: "Products successfully pushed on to the backend",
  });
}
