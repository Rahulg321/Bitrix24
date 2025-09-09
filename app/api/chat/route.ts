import { openai } from "@/lib/ai/available-models";
import { weatherTool } from "@/lib/ai/tools/weather";
import { stockTool } from "@/lib/ai/tools/stock";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({ message: "Hello, world!" });
}
