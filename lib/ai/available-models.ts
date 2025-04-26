import { createOpenAI } from "@ai-sdk/openai";
import "dotenv/config";
import Exa from "exa-js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const exa = new Exa(process.env.EXA_API_KEY);

export const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
  compatibility: "strict",
});
