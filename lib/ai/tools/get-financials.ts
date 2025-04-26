import { z } from "zod";
import { exa, openai } from "../available-models";
import { generateObject } from "ai";

const fetchCrunchbase = async (company: string) => {
  const result = await exa.searchAndContents(`${company} crunchbase page:`, {
    type: "keyword",
    numResults: 1,
    includeDomains: ["crunchbase.com"],
    includeText: [company],
  });
  return result.results[0];
};

const fetchFunding = async (company: string) => {
  const result = await exa.searchAndContents(`${company} Funding:`, {
    type: "keyword",
    numResults: 1,
    text: true,
    summary: {
      query: `Tell me about the funding (and if available, the valuation) of this company in detail. Do not tell me about the company, just give all the funding information in detail. If funding or valuation info is not preset, just reply with one word "NO".`,
    },
    livecrawl: "always",
    includeText: [company],
  });
  return result.results[0];
};

const fetchPitchbook = async (company: string) => {
  const result = await exa.searchAndContents(`${company} pitchbook page:`, {
    type: "keyword",
    numResults: 1,
    includeDomains: ["pitchbook.com"],
    includeText: [company],
  });
  return result.results[0];
};

const fetchFinancials = async (company: string) => {
  const result = await exa.searchAndContents(`${company} financials:`, {
    type: "keyword",
    numResults: 1,
    text: true,
    summary: {
      query: `Tell me about the financials of this company in detail. Do not tell me about the company, just give all the financial information in detail. If financial info is not preset, just reply with one word "NO".`,
    },
    livecrawl: "always",
    includeText: [company],
  });
  return result.results[0];
};

export const getCompanyFinancials = async (company: string) => {
  const results = await Promise.all([
    fetchCrunchbase(company),
    fetchFinancials(company),
    fetchPitchbook(company),
    fetchFunding(company),
  ]);

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    prompt:
      "Summarize the financials, pitchbook, and funding information for the company.\n\n" +
      JSON.stringify(results),
    schema: z.object({
      investors: z.array(z.string()),
      currentValuation: z.number().nullable(),
      totalRaised: z.number(),
    }),
  });
  return object;
};
