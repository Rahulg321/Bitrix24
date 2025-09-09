import { z } from "zod";
import { tool as createTool } from "ai";

export const stockTool = createTool({
  description: "Get price for a stock",
  inputSchema: z.object({
    symbol: z.string().describe("The stock symbol to get the price for"),
  }),
  execute: async function ({ symbol }) {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { symbol, price: 100 };
  },
});
