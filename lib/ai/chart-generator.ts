"use server";

import { Config, Result } from "@/lib/types";
import { generateObject } from "ai";
import { getGoogleModel } from "@/lib/ai/available-models";
import { z } from "zod";

export const generateChartConfig = async (
  results: Result[],
  userQuery: string,
) => {
  "use server";
  const system = `You are a data visualization expert. Given deal data with fields like company, revenue, ebitda, ebitdaMargin, location, etc., generate the best chart configuration to visualize the data and answer the user's query.

For multiple groups use multi-lines or grouped bars.

Here is an example complete config:
export const chartConfig = {
  type: "bar",
  xKey: "company",
  yKeys: ["revenue", "ebitda"],
  colors: {
    revenue: "#4CAF50",    // Green for revenue
    ebitda: "#2196F3",     // Blue for ebitda
  },
  legend: true,
  title: "Revenue vs EBITDA by Company"
}

Available chart types: "bar", "line", "pie"
Available fields: company, revenue, ebitda, ebitdaMargin, location, id

Choose the chart type and configuration that best answers the user's query.`;

  try {
    const { object: config } = await generateObject({
      model: getGoogleModel("gemini-1.5-flash") as any,
      system,
      prompt: `Given the following deal data from a database query result, generate the chart config that best visualizes the data and answers the user's query.

User Query: ${userQuery}

Data: ${JSON.stringify(results, null, 2)}`,
      schema: z.object({
        type: z.enum(["bar", "line", "pie"]),
        xKey: z.string(),
        yKeys: z.array(z.string()),
        title: z.string(),
        description: z.string().optional(),
        takeaway: z.string().optional(),
        legend: z.boolean().default(true),
      }),
    });

    // Generate colors for the yKeys
    const colors: Record<string, string> = {};
    config.yKeys.forEach((key, index) => {
      const colorMap: Record<string, string> = {
        revenue: "#4CAF50",      // Green
        ebitda: "#2196F3",       // Blue  
        ebitdaMargin: "#FF9800", // Orange
        deals: "#9C27B0",        // Purple
        location: "#F44336",     // Red
        company: "#607D8B",      // Blue Grey
      };
      colors[key] = colorMap[key] || `hsl(${index * 60}, 70%, 50%)`;
    });

    const updatedConfig: Config = { 
      ...config, 
      colors,
      description: config.description || `Chart showing ${config.yKeys.join(' and ')} data`,
      takeaway: config.takeaway || `Found ${results.length} deals with relevant data`
    };
    
    return { config: updatedConfig };
  } catch (e) {
    console.error("Failed to generate chart config:", e);
    // Fallback config
    return {
      config: {
        type: "bar" as const,
        xKey: "company",
        yKeys: ["revenue", "ebitda"],
        title: "Deal Overview",
        description: "Overview of deal data",
        takeaway: `Found ${results.length} deals`,
        legend: true,
        colors: {
          revenue: "#4CAF50",
          ebitda: "#2196F3"
        }
      }
    };
  }
};

