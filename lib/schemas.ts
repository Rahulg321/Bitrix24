// lib/schemas.ts
import * as z from "zod";
import { DealDocumentCategory, DealStatus } from "@prisma/client";

export const dealSpecificationsFormSchema = z.object({
  isReviewed: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seen: z.boolean().default(false),
  status: z.nativeEnum(DealStatus),
});

export type dealSpecificationsFormSchemaType = z.infer<
  typeof dealSpecificationsFormSchema
>;

// define a helper that is either "instanceof File + size check" in the browser,
// or just a no-op z.any() on the server where File === undefined
const fileSchema = typeof File !== "undefined"
  ? z
      .instanceof(File)
      .refine((file) => file.size <= 20 * 1024 * 1024, {
        message: "File size must be less than 20MB",
      })
  : z.any();

export const dealDocumentFormSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category:    z.nativeEnum(DealDocumentCategory),
  file:        fileSchema,
});

export type DealDocumentFormValues = z.infer<
  typeof dealDocumentFormSchema
>;

// and do the same for your CIM upload
const cimFileSchema = typeof File !== "undefined"
  ? z
      .instanceof(File)
      .refine((file) => file.size <= 10 * 1024 * 1024, {
        message: "File size must be less than 10MB",
      })
  : z.any();

export const cimFormSchema = z.object({
  title:   z.string().min(1, "Title is required"),
  caption: z.string().min(1, "Caption is required"),
  status:  z.enum(["IN_PROGRESS", "COMPLETED"]),
  file:    cimFileSchema,
});

export type CimFormValues = z.infer<typeof cimFormSchema>;

export const screenDealSchema = z.object({
  title:       z.string(),
  explanation: z.string(),
  sentiment:   z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
});

export type screenDealSchemaType = z.infer<typeof screenDealSchema>;
