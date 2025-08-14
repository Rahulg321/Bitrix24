"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";
import {
  dealSpecificationsFormSchemaType,
  dealSpecificationsFormSchema,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function updateDealSpecificationsAction(
  values: dealSpecificationsFormSchemaType,
  dealUid: string,
) {
  const userSession = await auth();

  if (!userSession) {
    return {
      success: false,
      message: "You are not authorized to add tags to this deal",
    };
  }

  if (!dealUid) {
    console.log("Deal uid is not present", dealUid);
    return {
      success: false,
      message: "Deal uid is not present",
    };
  }

  const validatedFields = dealSpecificationsFormSchema.safeParse(values);

  if (!validatedFields.success) {
    console.log("error in validating fields");
    return {
      success: false,
      message: "invalid fields",
    };
  }

  try {
    await prismaDB.deal.update({
      where: {
        id: dealUid,
      },
      data: {
        seen: validatedFields.data.seen,
        status: validatedFields.data.status,
        reviewed: validatedFields.data.isReviewed,
        published: validatedFields.data.isPublished,
      },
    });

    revalidatePath(`/raw-deals/${dealUid}`);
    revalidatePath(`/raw-deals`);

    return {
      success: true,
      message: "Deal specifications updated successfully",
    };
  } catch (error) {
    console.log("error in updating deal specifications", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "error in updating deal specifications",
    };
  }
}
