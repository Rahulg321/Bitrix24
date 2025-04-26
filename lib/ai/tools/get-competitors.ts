import { generateObject, generateText, Output, tool } from "ai";
import { exa, google, openai } from "../available-models";
import { z } from "zod";

const fetchCompetitorsGoogle = async (company: string, n: number = 2) => {
  console.log(`Getting competitors for ${company}`);

  const { text: competitorsRaw, sources } = await generateText({
    model: google("gemini-1.5-flash", {
      useSearchGrounding: true,
    }),

    system: "You are an expert analyst and researcher.",
    prompt: `Please identify similar competitors (max ${n}) to the following company: ${company}.
  For each competitor, provide a brief description of their product, a link to their website, and an explanation of why they are similar.`,
  });

  console.log(
    "generated competitors from google with sources",
    competitorsRaw,
    sources,
  );
  return { competitorsRaw, sources };
};

const fetchCompetitorsFromWeb = async (company: string, n: number = 2) => {
  console.log(`Getting competitors info for ${company}`);
  const {
    experimental_output: { competitors },
  } = await generateText({
    model: openai("gpt-4o"),
    prompt: `For the following company provide:
          - find similar competitors (max ${n}) to the following company: ${company}.
          - for each competitor, provide a brief description of their product, a link to their website, and an explanation of why they are similar.
   
          <company>${company}</company>`,
    tools: {
      searchWeb: tool({
        description: "Search the web for information about a company",
        parameters: z.object({
          query: z.string().min(1).max(100).describe("The search query"),
        }),
        execute: async ({ query }) => {
          const { results } = await exa.searchAndContents(query, {
            livecrawl: "always",
            numResults: 5,
          });
          return { results };
        },
      }),
    },
    maxSteps: 4,
    experimental_output: Output.object({
      schema: z.object({
        competitors: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            website: z.string().url(),
            similarity: z.string(),
            sources: z.array(z.string()),
          }),
        ),
      }),
    }),
  });
  console.log(`Successfully fetched company info for ${company}`);
  return competitors;
};

export const getCompetitors = async (company: string, n: number = 2) => {
  console.log(`Getting competitors for ${company}`);

  const results = await Promise.all([
    fetchCompetitorsGoogle(company, n),
    fetchCompetitorsFromWeb(company, n),
  ]);

  const { object: competitors } = await generateObject({
    model: openai("gpt-4o-mini"),
    prompt:
      "Extract the competitors from the following text:\n\nRaw competitors:\n" +
      JSON.stringify(results),
    output: "array",
    schema: z.object({
      name: z.string(),
      description: z.string(),
      website: z.string().url(),
      similarity: z.string(),
      sources: z.array(z.string()),
    }),
  });

  console.log(
    `Competitors retrieved: ${competitors.map((competitor) => competitor.name).join(", ")}`,
  );

  return competitors;
};
