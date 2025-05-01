import * as z from "zod";

export const cimFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  caption: z.string().min(1, "Caption is required"),
  status: z.enum(["IN_PROGRESS", "COMPLETED"]),
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, {
    message: "File size must be less than 10MB",
  }),
});

export const pocFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  workPhone: z.string().optional(),
  email: z.string().email("Email must be valid")
});

export type CimFormValues = z.infer<typeof cimFormSchema>;

export type PocFormValues = z.infer<typeof pocFormSchema>;

export const screenDealSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
});

export type screenDealSchemaType = z.infer<typeof screenDealSchema>;
