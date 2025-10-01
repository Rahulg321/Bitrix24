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
  location: z.string().optional().describe("Company location"),
  industry: z.string().optional().describe("Company industry"),
  minEbitdaMargin: z.number().optional().describe("Minimum EBITDA margin percentage"),
  maxEbitdaMargin: z.number().optional().describe("Maximum EBITDA margin percentage"),
  limit: z.number().optional().default(10).describe("Maximum number of results to return"),
  revenueFilter: z.object({
    operator: z.enum(["greaterThan", "lessThan", "equals", "between", ">", "<", "="]),
    value: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional().describe("Revenue filter with operator and value"),
  ebitdaFilter: z.object({
    operator: z.enum(["greaterThan", "lessThan", "equals", "between", ">", "<", "="]),
    value: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional().describe("EBITDA filter with operator and value"),
  ebitdaMarginFilter: z.object({
    operator: z.enum(["greaterThan", "lessThan", "equals", "between", ">", "<", "="]),
    value: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional().describe("EBITDA margin filter with operator and value"),
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
  async execute(input: any) {
    try {
      const {
        id,
        title,
        minEbitda,
        maxEbitda,
        minRevenue,
        maxRevenue,
        exactRevenue,
        location,
        industry,
        minEbitdaMargin,
        maxEbitdaMargin,
        limit = 10,
        revenueFilter,
        ebitdaFilter,
        ebitdaMarginFilter
      } = input;

      const where: any = {};

      if (id) where.id = id;
      if (title) where.title = { contains: title, mode: "insensitive" };
      
      if (revenueFilter) {
        where.revenue = {};
        if (revenueFilter.operator === "greaterThan" || revenueFilter.operator === ">") {
          where.revenue.gte = revenueFilter.value;
        } else if (revenueFilter.operator === "lessThan" || revenueFilter.operator === "<") {
          where.revenue.lte = revenueFilter.value;
        } else if (revenueFilter.operator === "equals" || revenueFilter.operator === "=") {
          where.revenue = revenueFilter.value;
        } else if (revenueFilter.operator === "between") {
          where.revenue.gte = revenueFilter.min;
          where.revenue.lte = revenueFilter.max;
        }
      } else if (exactRevenue !== undefined) {
        where.revenue = exactRevenue;
      } else if (minRevenue !== undefined || maxRevenue !== undefined) {
        where.revenue = {};
        if (minRevenue !== undefined) where.revenue.gte = minRevenue;
        if (maxRevenue !== undefined) where.revenue.lte = maxRevenue;
      }

      if (ebitdaFilter) {
        where.ebitda = {};
        if (ebitdaFilter.operator === "greaterThan" || ebitdaFilter.operator === ">") {
          where.ebitda.gte = ebitdaFilter.value;
        } else if (ebitdaFilter.operator === "lessThan" || ebitdaFilter.operator === "<") {
          where.ebitda.lte = ebitdaFilter.value;
        } else if (ebitdaFilter.operator === "equals" || ebitdaFilter.operator === "=") {
          where.ebitda = ebitdaFilter.value;
        } else if (ebitdaFilter.operator === "between") {
          where.ebitda.gte = ebitdaFilter.min;
          where.ebitda.lte = ebitdaFilter.max;
        }
      } else if (minEbitda !== undefined || maxEbitda !== undefined) {
        where.ebitda = {};
        if (minEbitda !== undefined) where.ebitda.gte = minEbitda;
        if (maxEbitda !== undefined) where.ebitda.lte = maxEbitda;
      }

      if (location) {
        where.companyLocation = { 
          contains: location, 
          mode: "insensitive" 
        };
      }

      if (industry) {
        where.industry = { 
          contains: industry, 
          mode: "insensitive" 
        };
      }

      if (ebitdaMarginFilter) {
        where.ebitdaMargin = {};
        if (ebitdaMarginFilter.operator === "greaterThan" || ebitdaMarginFilter.operator === ">") {
          where.ebitdaMargin.gte = ebitdaMarginFilter.value;
        } else if (ebitdaMarginFilter.operator === "lessThan" || ebitdaMarginFilter.operator === "<") {
          where.ebitdaMargin.lte = ebitdaMarginFilter.value;
        } else if (ebitdaMarginFilter.operator === "equals" || ebitdaMarginFilter.operator === "=") {
          where.ebitdaMargin = ebitdaMarginFilter.value;
        } else if (ebitdaMarginFilter.operator === "between") {
          where.ebitdaMargin.gte = ebitdaMarginFilter.min;
          where.ebitdaMargin.lte = ebitdaMarginFilter.max;
        }
      } else if (minEbitdaMargin !== undefined || maxEbitdaMargin !== undefined) {
        where.ebitdaMargin = {};
        if (minEbitdaMargin !== undefined) where.ebitdaMargin.gte = minEbitdaMargin;
        if (maxEbitdaMargin !== undefined) where.ebitdaMargin.lte = maxEbitdaMargin;
      }

      const deals = await prisma.deal.findMany({
        where,
        select: {
          id: true,
          title: true,
          ebitda: true,
          revenue: true,
          companyLocation: true,
          ebitdaMargin: true,
          industry: true,
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
      console.error("Database query failed:", error);
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
    const validatedInput = databaseQueryInputSchema.parse(input);
    if (typeof databaseQueryTool.execute !== 'function') {
        throw new Error("databaseQueryTool.execute is not defined");
    }

    const result = await databaseQueryTool.execute!(validatedInput, {
        toolCallId: "manual-call",
        messages: [
            {
                content: "Manual execution via API route",
            } as ModelMessage,
        ],
    });

    if (!result || !result.success) {
      throw new Error(result?.message || "Query execution failed");
    }

    return result.deals;
  } catch (error) {
    console.error("executeDatabaseQuery failed:", error);
    throw error;
  }
}

export const tools = {
  databaseQueryTool,
} satisfies ToolSet;
