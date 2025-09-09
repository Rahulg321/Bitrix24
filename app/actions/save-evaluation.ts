"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import { Sentiment } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

interface DealEvaluation {
  success: boolean;
  title?: string;
  score?: number;
  sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  explanation?: string;
  content?: string;
  error?: string;
  message?: string;
}

/**
 * Saves the AI evaluation result to the database
 * @param dealId - The ID of the deal that was evaluated
 * @param evaluation - The evaluation result from the AI
 * @param screenerId - The ID of the screener used for evaluation
 * @returns The result of the save operation
 */
export async function saveEvaluation(
  dealId: string,
  evaluation: DealEvaluation,
  screenerId: string,
) {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized - User not authenticated",
    };
  }

  if (!evaluation.success) {
    return {
      success: false,
      error: "Cannot save failed evaluation",
    };
  }

  try {
    // Validate required fields
    if (!evaluation.title || !evaluation.explanation) {
      return {
        success: false,
        error: "Missing required evaluation fields (title or explanation)",
      };
    }

    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const { ok, remaining, reset } = await rateLimit(
      `api:save-evaluation:${ip}`,
      10, // 10 requests per minute
      60_000, // 1 minute
    );

    if (!ok) {
      console.log("Rate limit excedded for save evaluation");

      return {
        success: false,
        message: "Too many requests",
      };
    }

    // Map sentiment string to enum
    let sentiment: Sentiment = Sentiment.NEUTRAL;
    if (evaluation.sentiment) {
      switch (evaluation.sentiment) {
        case "POSITIVE":
          sentiment = Sentiment.POSITIVE;
          break;
        case "NEGATIVE":
          sentiment = Sentiment.NEGATIVE;
          break;
        case "NEUTRAL":
        default:
          sentiment = Sentiment.NEUTRAL;
          break;
      }
    }

    // Create the AI screening record
    const savedEvaluation = await prismaDB.aiScreening.create({
      data: {
        dealId,
        title: evaluation.title,
        explanation: evaluation.explanation,
        score: evaluation.score ? Math.round(evaluation.score) : null,
        content: evaluation.content || null,
        sentiment,
        screenerId,
      },
    });

    // Revalidate relevant paths to update the UI
    revalidatePath(`/raw-deals/${dealId}`);
    revalidatePath(`/manual-deals/${dealId}`);
    revalidatePath(`/inferred-deals/${dealId}`);

    return {
      success: true,
      message: "Evaluation saved successfully",
      evaluationId: savedEvaluation.id,
      data: savedEvaluation,
    };
  } catch (error) {
    console.error("Error saving evaluation:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to save evaluation: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "An unknown error occurred while saving the evaluation",
    };
  }
}
