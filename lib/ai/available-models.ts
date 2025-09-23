import { createOpenAI } from "@ai-sdk/openai";
import "dotenv/config";
import Exa from "exa-js";
import OpenAI from "openai";
import { google } from "@ai-sdk/google";

export const exa = new Exa(process.env.EXA_API_KEY);

export const openai = createOpenAI({
  apiKey: process.env.AI_API_KEY,
});

export const openaiClient = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

export const getGoogleModel = (modelName: string) => google(modelName);
