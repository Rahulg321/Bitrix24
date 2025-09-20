import { tool, ToolSet } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";
import type { ModelMessage } from "ai";

const databaseQueryInputSchema = z.object({
  id: z.string().optional().describe("Specific deal ID to search for"),
  title: z.string().optional().describe("Search for deals containing this text in the title"),
  minEbitda: z.number().optional().describe("Minimum EBITDA amount"),
  maxEbitda: z.number().optional().describe("Maximum EBITDA amount"),
  minRevenue: z.number().optional().describe("Minimum revenue amount"),
  maxRevenue: z.number().optional().describe("Maximum revenue amount"),
  exactRevenue: z.number().optional().describe("Exact revenue amount"),
  companyLocation: z.string().optional().describe("Company location"),
  minEbitdaMargin: z.number().optional().describe("Minimum EBITDA margin percentage"),
  maxEbitdaMargin: z.number().optional().describe("Maximum EBITDA margin percentage"),
  limit: z.number().optional().default(10).describe("Maximum number of results to return"),
});

export const databaseQueryTool = tool({
  description: "Search for deal information in the database.",
  inputSchema: databaseQueryInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    count: z.number(),
    deals: z.array(z.any()).optional(),
  }),
  async execute({
    id,
    title,
    minEbitda,
    maxEbitda,
    minRevenue,
    maxRevenue,
    exactRevenue,
    companyLocation,
    minEbitdaMargin,
    maxEbitdaMargin,
    limit = 10,
  }) {
    try {
      const where: any = {};

      if (id) where.id = id;
      if (title) where.title = { contains: title, mode: "insensitive" };
      if (minEbitda !== undefined || maxEbitda !== undefined) {
        where.ebitda = {};
        if (minEbitda !== undefined) where.ebitda.gte = minEbitda;
        if (maxEbitda !== undefined) where.ebitda.lte = maxEbitda;
      }
      if (exactRevenue !== undefined) {
        where.revenue = exactRevenue;
      } else if (minRevenue !== undefined || maxRevenue !== undefined) {
        where.revenue = {};
        if (minRevenue !== undefined) where.revenue.gte = minRevenue;
        if (maxRevenue !== undefined) where.revenue.lte = maxRevenue;
      }
      if (companyLocation) {
        where.companyLocation = { contains: companyLocation, mode: "insensitive" };
      }
      if (minEbitdaMargin !== undefined || maxEbitdaMargin !== undefined) {
        where.ebitdaMargin = {};
        if (minEbitdaMargin !== undefined) where.ebitdaMargin.gte = minEbitdaMargin;
        if (maxEbitdaMargin !== undefined) where.ebitdaMargin.lte = maxEbitdaMargin;
      }

      console.log("Querying deals with where:", where);

      const deals = await prisma.deal.findMany({
        where,
        select: {
          id: true,
          title: true,
          ebitda: true,
          revenue: true,
          companyLocation: true,
          ebitdaMargin: true,
          createdAt: true,
        },
        orderBy: { ebitda: "desc" },
        take: limit,
      });

      if (deals.length === 0) {
        return {
          success: false,
          message: "No deals found matching the specified criteria.",
          count: 0,
          deals: [],
        };
      }
      console.log(`✅ Found ${deals.length} deal(s).`);
      console.log("Sample deal:", deals[0]);
      return {
        success: true,
        message: `Found ${deals.length} deal(s) matching your criteria.`,
        count: deals.length,
        deals: deals.map((deal) => ({
          ...deal,
          ebitda: deal.ebitda ? `$${deal.ebitda.toLocaleString()}` : "N/A",
          revenue: deal.revenue ? `$${deal.revenue.toLocaleString()}` : "N/A",
          ebitdaMargin: deal.ebitdaMargin ? `${deal.ebitdaMargin}%` : "N/A",
        })),
      };
    } catch (error) {
      console.error("❌ Query failed:", error);
      return {
        success: false,
        message: "Error while executing query.",
        error: error instanceof Error ? error.message : String(error),
        count: 0,
        deals: [],
      };
    }
  },
});

export async function executeDatabaseQuery(input: unknown) {
  try {
    // ✅ Use the raw schema (fully typed)
    const validatedInput = databaseQueryInputSchema.parse(input);
    if (typeof databaseQueryTool.execute !== 'function') {
        throw new Error("databaseQueryTool.execute is not defined");
    }

    const result = await databaseQueryTool.execute!(validatedInput, {
        toolCallId: "manual-call",
        messages: [
            {
                content: "Manual execution via API route",
            } as ModelMessage, // Ensure this matches the ModelMessage type
        ],
    });

    // Handle both possible return types
    let actualResult;
    if (Symbol.asyncIterator in result) {
      // If it's an AsyncIterable, get the first (and likely only) value
      for await (const item of result) {
        actualResult = item;
        break;
      }
    } else {
      // If it's a direct result object
      actualResult = result;
    }

    if (!actualResult || !actualResult.success) {
      throw new Error(actualResult?.message || "Query execution failed");
    }

    return actualResult.deals;
  } catch (error) {
    console.error("❌ executeDatabaseQuery failed:", error);
    throw error;
  }
}

export const tools = {
  databaseQueryTool,
} satisfies ToolSet;
