"use server";

import { streamText, tool } from "ai";
import { createStreamableValue } from "ai/rsc";
import { getCompetitors } from "@/lib/ai/tools/get-competitors";
import { z } from "zod";
import { getCompanyInfo } from "@/lib/ai/tools/company-info";
import { getFounderInfo } from "@/lib/ai/tools/get-founder-info";
import { assessFounderMarketFit } from "@/lib/ai/tools/get-founder-info";
import { getCompanyFinancials } from "@/lib/ai/tools/get-financials";
import { generateMemo } from "@/lib/ai/tools/generate-memo";
import { openai } from "@/lib/ai/available-models";

export async function generateCompanyDeepResearch(input: string) {
  const stream = createStreamableValue("");
  (async () => {
    try {
      const { textStream, fullStream } = streamText({
        model: openai("gpt-4o-2024-08-06"),
        prompt: input,
        maxSteps: 15,
        tools: {
          getCompanyInfo: tool({
            description: "Get information about a company",
            parameters: z.object({
              companyName: z.string(),
            }),
            execute: async ({ companyName }) => {
              return await getCompanyInfo(companyName);
            },
          }),
          getCompetitors: tool({
            description: "Get competitors of a company",
            parameters: z.object({
              companyName: z.string(),
            }),
            execute: async ({ companyName }) => {
              return await getCompetitors(companyName);
            },
          }),
          getPersonInfo: tool({
            description:
              "Get information (tweets, blog posts, linkedin profile) about a person",
            parameters: z.object({
              name: z.string(),
            }),
            execute: async ({ name: founderName }) => {
              return await getFounderInfo(founderName);
            },
          }),
          assessFounderMarketFit: tool({
            description: "Assess the market fit of a founder",
            parameters: z.object({
              founderName: z.string(),
              companyInfo: z.string(),
            }),
            execute: async ({ founderName, companyInfo }) => {
              return await assessFounderMarketFit({ founderName, companyInfo });
            },
          }),
          getFinancialInformation: tool({
            description: "Get financial information about a company",
            parameters: z.object({
              companyName: z.string(),
            }),
            execute: async ({ companyName }) => {
              return await getCompanyFinancials(companyName);
            },
          }),
          generateInvestmentPitch: tool({
            description: "Generate an investment pitch for a company",
            parameters: z.object({
              companyName: z.string(),
              companyInfo: z.string(),
              competitors: z.array(z.string()),
              founderInfo: z.string(),
              financialInfo: z.string(),
            }),
            execute: async ({
              companyName,
              companyInfo,
              competitors,
              founderInfo,
              financialInfo,
            }) => {
              return await generateMemo(
                companyName,
                JSON.stringify({
                  companyInfo,
                  competitors,
                  founderInfo,
                  financialInfo,
                }),
              );
            },
          }),
        },
      });

      // Stream text directly to the client
      for await (const chunk of textStream) {
        stream.update(stream.value + chunk);
      }

      // Process full stream for logging and additional processing
      for await (const delta of fullStream) {
        if (delta.type === "tool-call") {
          console.log("Tool call:", delta.toolName);
        }
        if (delta.type === "tool-result") {
          console.log(`Tool result from ${delta.toolName}`);
        }
      }
    } catch (error) {
      console.error("Error in streaming:", error);
      //   stream.update(
      //     (current) =>
      //       current + "\nAn error occurred during research generation.",
      //   );
    } finally {
      stream.done();
    }
  })();

  return { output: stream.value };
}
