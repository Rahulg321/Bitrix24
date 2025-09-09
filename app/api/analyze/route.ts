import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";
import { inferRawDealsSchema } from "@/lib/zod-schemas/raw-deal-schema";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

export const maxDuration = 30;

export async function POST(request: Request) {
  const userSession = await auth();

  if (!userSession?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("inside analyze route");

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { ok, remaining, reset } = await rateLimit(
    `api:analyze:${ip}`,
    10,
    60_000,
  );

  if (!ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "RateLimit-Limit": "10",
        "RateLimit-Remaining": String(remaining),
        "RateLimit-Reset": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  let file: File | null = null;
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data
      const formData = await request.formData();
      file = formData.get("pdf") as File;
    } else if (contentType.includes("application/json")) {
      // Handle JSON request (useObject hook might send this)
      const jsonData = await request.json();

      // Check if the file data is in the JSON payload
      if (jsonData.pdf && jsonData.pdf.data) {
        // Extract file data from JSON
        const fileData = jsonData.pdf.data;
        const fileName = jsonData.pdf.name || "document.pdf";

        // Convert base64 to Uint8Array
        const binaryString = atob(fileData.split(",")[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a File object
        file = new File([bytes], fileName, { type: "application/pdf" });
      } else {
        return Response.json(
          { error: "No PDF file data found in request" },
          { status: 400 },
        );
      }
    } else {
      return Response.json(
        {
          error:
            "Unsupported content type. Expected multipart/form-data or application/json",
        },
        { status: 400 },
      );
    }

    if (!file) {
      return Response.json({ error: "No PDF file provided" }, { status: 400 });
    }

    console.log("File received:", file.name, "Size:", file.size);

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const charArray = Array.from(uint8Array, (byte) =>
      String.fromCharCode(byte),
    );
    const binaryString = charArray.join("");
    const base64Data = btoa(binaryString);
    const fileDataUrl = `data:application/pdf;base64,${base64Data}`;

    console.log("Starting AI analysis for PDF...");

    const result = await streamObject({
      model: openai("gpt-4o"),
      system: `You are a specialized business deal analyst. Your task is to extract and analyze business deals from PDF documents containing deal listings.

IMPORTANT GUIDELINES:
- Focus ONLY on business deals, business listings, or business opportunities
- Extract deals that are for sale, acquisition, or investment opportunities
- Ignore any content that is NOT related to business deals (news articles, general business information, etc.)
- If the PDF contains no business deals, return an empty array
- Each deal should be structured according to the provided schema
- Be precise with financial figures and extract them as numbers when possible

CRITICAL DATA TYPE REQUIREMENTS:
- firstName and lastName: If not available, use empty string "" instead of null
- email, linkedinUrl, workPhone: If not available, use empty string "" instead of null
- ebitda, askingPrice, ebitdaMargin, revenue, grossRevenue: If not available, use 0 instead of null
- title and industry: These are required fields - always provide meaningful values
- brokerage, companyLocation, dealTeaser: If not available, use empty string "" instead of null
- tags: If not available, use empty array [] instead of null

DEAL EXTRACTION RULES:
- Look for businesses being sold, acquired, or seeking investment
- Identify asking prices, revenue figures, EBITDA, and other financial metrics
- Extract contact information when available (names, emails, phone numbers)
- Note the source/brokerage platform and industry classification
- Provide detailed deal descriptions that capture the business opportunity
- NEVER return null values - use appropriate defaults (empty strings for text, 0 for numbers, empty arrays for tags)

Return ONLY the array of deals in the exact format specified by the schema, ensuring all required fields are present and no null values exist.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this PDF and extract all business deals, business listings, or business opportunities. Focus only on deals that are for sale, acquisition, or investment. Ignore any other content. Extract each deal according to the specified schema and return them as an array. Remember: never return null values - use empty strings for missing text, 0 for missing numbers, and empty arrays for missing tags.",
            },
            {
              type: "file",
              data: fileDataUrl,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
      schema: inferRawDealsSchema,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error during AI analysis:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    return Response.json(
      {
        error: "AI analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
