"use server";

import prismaDB from "@/lib/prisma.server";
import { revalidatePath } from "next/cache";
import { DealType } from "@prisma/client";

/**
 * Revert a Deal record to the snapshot stored in `dealHistory`.
 * @param versionId – id of the dealHistory row we want to restore
 * @param dealId    – id of the Deal to update (redundant but explicit)
 */
const revertDealVersion = async (versionId: string, dealId: string) => {
  try {
    // 1. fetch snapshot to restore
    const version = await prismaDB.dealHistory.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return { type: "error" as const, message: "Version not found" };
    }

    // 2. Extract snapshot & drop immutable columns
    const { snapshot } = version as { snapshot: Record<string, any> };
    if (!snapshot) {
      return {
        type: "error" as const,
        message: "Snapshot missing for the selected version.",
      };
    }

    // Remove prisma-generated/immutable fields
    const {
      id: _discardId,
      createdAt: _discardCreated,
      updatedAt: _discardUpdated,
      ...dataToRestore
    } = snapshot as Record<string, any>;

    // 3. Perform update (this will itself write a new version via middleware)
    const updated = await prismaDB.deal.update({
      where: { id: dealId },
      data: dataToRestore,
    });

    // 4. Revalidate correct page route so UI updates
    switch (updated.dealType as DealType) {
      case "MANUAL":
        revalidatePath(`/manual-deals/${dealId}`);
        break;
      case "SCRAPED":
        revalidatePath(`/raw-deals/${dealId}`);
        break;
      case "AI_INFERRED":
        revalidatePath(`/inferred-deals/${dealId}`);
        break;
      default:
        break;
    }

    return { type: "success" as const };
  } catch (err) {
    console.error("Error reverting deal to version", err);
    return { type: "error" as const, message: "Failed to revert deal." };
  }
};

export default revertDealVersion;
