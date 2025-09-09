import { z } from "zod";

export const rawDealSchema = z.object({
  title: z.string().describe("The title of the deal"),
  brokerage: z.string().default("").describe("The brokerage of the deal"),
  firstName: z.string().optional().describe("The first name of the contact"),
  lastName: z.string().optional().describe("The last name of the contact"),
  tags: z.array(z.string()).default([]).describe("The tags of the deal"),
  email: z.string().optional().describe("The email of the contact"),
  linkedinUrl: z
    .string()
    .optional()
    .describe("The LinkedIn URL of the contact"),
  workPhone: z.string().optional().describe("The work phone of the contact"),
  dealCaption: z.string().default(""),
  revenue: z.number().optional().default(0).describe("The revenue of the deal"),
  ebitda: z.number().optional().default(0).describe("The EBITDA of the deal"),
  dealTeaser: z.string().optional().describe("The teaser of the deal"),
  grossRevenue: z
    .number()
    .optional()
    .default(0)
    .describe("The gross revenue of the deal"),
  askingPrice: z
    .number()
    .optional()
    .default(0)
    .describe("The asking price of the deal"),
  ebitdaMargin: z
    .number()
    .optional()
    .default(0)
    .describe("The EBITDA margin of the deal"),
  industry: z.string().describe("The industry of the deal"),
  sourceWebsite: z
    .string()
    .default("https://www.google.com")
    .describe("The source website of the deal"),
  companyLocation: z
    .string()
    .default("")
    .describe("The location of the company"),
});

export const inferRawDealsSchema = z.object({
  listings: z.array(rawDealSchema),
});

export type InferRawDealsSchema = z.infer<typeof inferRawDealsSchema>;
