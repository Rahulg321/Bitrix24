import { z } from "zod";

export const newScreenerFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        file.size <= 20 * 1024 * 1024 &&
        (file.type === "application/pdf" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      {
        message:
          "File size must be less than 20MB and must be a PDF or DOCX file",
      },
    ),
});

export type NewScreenerFormSchema = z.infer<typeof newScreenerFormSchema>;
