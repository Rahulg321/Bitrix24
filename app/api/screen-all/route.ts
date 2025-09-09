import { auth } from "@/auth";
import { pubSubClient } from "@/lib/pubsub-client";
import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

// const topicName = process.env.PUBSUB_TOPIC_NAME;

const WORKER_URL = process.env.WORKER_URL;

export async function POST(request: Request) {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { dealListings, screenerId, screenerContent, screenerName } =
    await request.json();

  if (
    !dealListings ||
    !Array.isArray(dealListings) ||
    dealListings.length === 0
  ) {
    return NextResponse.json(
      { message: "Invalid deal listings" },
      { status: 400 },
    );
  }

  if (!screenerId || !screenerContent || !screenerName) {
    console.log(
      "screener information is not present inside screen all function",
    );

    return NextResponse.json({ message: "Invalid screener" }, { status: 400 });
  }

  try {
    // We'll collect all the publish promises to run them in parallel
    // const publishPromises: Promise<string>[] = [];

    // Enqueue each deal (await to ensure completion before publish)
    for (const dealListing of dealListings) {
      const payload = {
        ...dealListing,
        userId: userSession.user.id,
        screenerId,
        screenerContent,
        screenerName,
      };
      await redisClient.rpush("dealListings", JSON.stringify(payload));

      // const dataBuffer = Buffer.from(JSON.stringify(payload));
      // const publishPromise = pubSubClient
      //   .topic(topicName!)
      //   .publishMessage({ data: dataBuffer });

      // publishPromises.push(publishPromise);
    }

    // Notify via pub/sub that new items are available for this user
    await redisClient.publish(
      "new_screen_call",
      JSON.stringify({ userId: userSession.user.id }),
    );

    // Await all messages to be published
    console.log("before promise.all");
    // await Promise.all(publishPromises);

    fetch(`${WORKER_URL}/process-queue`, { method: "POST" }).catch((err) => {
      console.error("Failed to trigger worker:", err.message);
      // You might want to add more robust error handling/logging here
    });

    console.log("all promises ran successfully");

    return NextResponse.json({ message: "Jobs Published Successfully" });
  } catch (error) {
    console.error("Error enqueuing deals:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
