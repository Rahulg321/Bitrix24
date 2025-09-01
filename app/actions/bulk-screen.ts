"use server";

import { Deal } from "@prisma/client";
import { redisClient } from "@/lib/redis";
import { auth } from "@/auth";

// Copied from worker code
interface Submission {
  id: string;
  userId: string;
  name: string;
  screenerContent: string;
  brokerage: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  workPhone: string;
  dealCaption: string;
  dealType: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  industry: string;
  sourceWebsite: string;
  companyLocation: string;
}

export default async function BulkScreenDeals(
  deals: Deal[],
  screenerContent: string, // could be screener id/name instead?
): Promise<{ status: number; message: string }> {
  // don't think this is necessary
  const userSession = await auth();

  if (!userSession) {
    return {
      message: "Unauthorized",
      status: 400,
    };
  }

  if (deals.length === 0) {
    return {
      status: 400,
      message: "No deals were selected",
    };
  }

  // if (!screenerId || !screenerContent || !screenerName) {
  // 	console.log(
  // 		"screener information is not present inside screen all function",
  // 	);

  // 	return NextResponse.json({ message: "Invalid screener" }, { status: 400 });
  // }

  // console.log("inside api route");
  // console.log(dealListings);
  // console.log(screenerId);

  // TODO: is this even necessary?
  try {
    console.log("connecting to redis");
    // if (!redisClient.isOpen) {
    //   await redisClient.connect();
    // }
    console.log("connected to redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    return {
      message: "Internal Server Error",
      status: 500,
    };
  }

  try {
    console.log("sending all deals to AI screener");

    deals.forEach(async (dealListing: any) => {
      const dealListingWithUserId = {
        ...dealListing,
        userId: userSession.user.id,
      };

			// typing doesn't actually do anything here
			const submission: Submission = {
				...dealListingWithUserId,
				screenerContent,
			}

      await redisClient.lpush(
        "dealListings",
        JSON.stringify(submission),
      );
    });

    // publish the message that a new screening call request was made
    await redisClient.publish(
      "new_screen_call",
      JSON.stringify({
        userId: userSession.user.id,
      }),
    );
  } catch (error) {
    console.error("Error pushing to Redis:", error);

    return {
      message: "Error pushing to Redis",
      status: 500,
    };
  }

  return {
    message: "Products successfully pushed on to the backend",
		status: 200
  }
}
