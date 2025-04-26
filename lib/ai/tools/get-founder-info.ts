import { generateObject, generateText } from "ai";
import { exa, google, openai } from "../available-models";
import { z } from "zod";

const getFounderTweets = async (founder: string) => {
  const { results: twitterProfiles } = await exa.searchAndContents(
    `${founder} Twitter (X) profile:`,
    {
      type: "keyword",
      text: true,
      numResults: 3,
      livecrawl: "always",
      includeDomains: ["x.com", "twitter.com"],
    },
  );

  console.log("twitter profiles", twitterProfiles);

  // Extract username using GPT-4
  const {
    object: { username },
  } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      username: z
        .string()
        .min(1)
        .describe(`${founder} Twitter username`)
        .nullable(),
    }),
    prompt: `Please extract the Twitter username for ${founder} from the following text: ${JSON.stringify(twitterProfiles)}`,
  });

  console.log("twitter username", username);

  // Fetch tweets if username found
  if (!username) {
    return `Could not find Twitter username for ${founder}`;
  }

  const result = await exa.searchAndContents(
    `tweets from:${username} -filter:replies`,
    {
      type: "keyword",
      livecrawl: "always",
      includeDomains: ["twitter.com", "x.com"],
      includeText: [username],
    },
  );

  console.log("tweets", result.results);

  return result.results;
};

const getFounderLinkedinPosts = async (founder: string) => {
  const { results: linkedinProfiles } = await exa.searchAndContents(
    `${founder} linkedin profile`,
    {
      type: "keyword",
      text: true,
      numResults: 3,
      livecrawl: "always",
      includeDomains: ["linkedin.com"],
    },
  );

  console.log("linkedin profiles", linkedinProfiles);

  // Extract username using GPT-4
  const {
    object: { username },
  } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      username: z
        .string()
        .min(1)
        .describe(`${founder} Twitter username`)
        .nullable(),
    }),
    prompt: `Please extract the LinkedIn username for ${founder} from the following text: ${JSON.stringify(linkedinProfiles)}`,
  });

  console.log("linkedin username", username);

  // Fetch tweets if username found
  if (!username) {
    return `Could not find LinkedIn username for ${founder}`;
  }

  const result = await exa.searchAndContents(
    `posts from:${username} -filter:replies`,
    {
      type: "keyword",
      livecrawl: "always",
      includeDomains: ["linkedin.com"],
      includeText: [username],
    },
  );

  console.log("linkedin posts", result.results);

  return result.results;
};

const getFounderBackground = async (founder: string) => {
  const exaSearch = exa.searchAndContents(`${founder} Linkedin profile`, {
    type: "keyword",
    numResults: 2,
    livecrawl: "always",
    includeDomains: ["linkedin.com"],
  });

  const googleSearch = generateText({
    model: google("gemini-1.5-flash", {
      useSearchGrounding: true,
    }),
    prompt: `Please provide a brief summary of the following person's background. <person_name>${founder}</person_name>.`,
  });

  const [{ text }, { results }] = await Promise.all([googleSearch, exaSearch]);

  console.log("searching for founder background");
  console.log("google search", text);
  console.log("exa search", results);

  return { text, results };
};

const getFounderWebsiteAndPosts = async (founder: string) => {
  const result = await exa.searchAndContents(`${founder} website`, {
    type: "keyword",
    text: true,
    numResults: 4,
    livecrawl: "always",
  });

  const {
    object: { url },
  } = await generateObject({
    model: openai("gpt-4o"),
    prompt: `From the following search results, extract the website URL of the following person <person_name>${founder}</person_name>.\n\n<search_results>${JSON.stringify(result.results)}</search_results>`,
    schema: z.object({
      url: z
        .string()
        .nullable()
        .describe(
          `The personal website for ${founder}. If no website is found, return null. This should be only the domain name e.g. www.example.com`,
        ),
    }),
  });

  if (url) {
    console.log("searching for founder website and posts", url);
    const result = await exa.searchAndContents(url, {
      category: "personal site",
      type: "neural",
      text: true,
      numResults: 1,
      livecrawl: "always",
      subpages: 2,
      subpageTarget: ["blog", "posts", "writing"],
      includeDomains: [url],
    });

    console.log("founder website and posts", result.results);

    return result.results[0];
  } else {
    return [];
  }
};

export const assessFounderMarketFit = async ({
  founderName,
  companyInfo,
}: {
  founderName: string;
  companyInfo: string;
}) => {
  const { text } = await generateText({
    model: openai("o3-mini"),
    system: "You are a partner at a VC fund looking to invest in a startup...",
    prompt: `<founder_name>${founderName}</founder_name>\n\n<search_results>${JSON.stringify({ companyInfo })}</search_results>`,
  });
  console.log("assess founder market fit", text);
  return text;
};

export const getFounderInfo = async (founderName: string) => {
  const founderInfo = await Promise.all([
    getFounderTweets(founderName),
    getFounderLinkedinPosts(founderName),
    getFounderBackground(founderName),
    getFounderWebsiteAndPosts(founderName),
  ]);
  console.log("founder info", founderInfo);
  return founderInfo;
};
