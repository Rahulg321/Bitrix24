import { z } from 'zod';

// Define or import the DealDocumentCategory enum
export enum DealDocumentCategory {
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  OTHER = 'OTHER',
}

// lib/server/schemas.ts  (no File references)
export const dealDocumentServerSchema = z.object({
  title:       z.string().min(1),
  description: z.string().min(1),
  category:    z.nativeEnum(DealDocumentCategory),
})

// lib/client/schemas.ts  (file validation lives here)
export const dealDocumentClientSchema = dealDocumentServerSchema.extend({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 20 * 1024 * 1024, {
      message: 'File size must be < 20 MB',
    }),
})
