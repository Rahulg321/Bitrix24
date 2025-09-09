import { Timestamp } from "firebase/firestore";

export type TransformedDeal = {
  brokerage: string;
  firstName?: string;
  lastName?: string;
  linkedinUrl?: string;
  email?: string;
  workPhone?: string;
  dealCaption: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  industry: string;
  sourceWebsite: string;
  companyLocation?: string;
};

export type ManualDeal = {
  id: string; // Unique ID of the deal
  brokerage: string; // The brokerage company name
  first_name?: string; // First name of the contact (optional, as it may be missing in some rows)
  last_name?: string; // Last name of the contact (optional, as it may be missing in some rows)
  linkedinurl?: string; // LinkedIn profile URL (optional, as it may be missing in some rows)
  work_phone?: string; // Work phone number (optional, as it may be missing in some rows)
  deal_caption: string; // Description of the deal
  revenue: number; // Revenue of the deal
  ebitda: number; // EBITDA of the deal
  title?: string;
  gross_revenue?: number;
  asking_price?: number;
  ebitda_margin: number; // EBITDA margin (decimal value)
  industry: string; // Industry category of the deal
  source_website: string; // URL of the deal's source listing
  company_location?: string; // Location of the company (optional)
  created_at: Timestamp;
};

export type EvalOptions = {
  userPrompt?: string;
  sections?: string[];
  tone?: "bullet" | "narrative";
  detailLevel?: "short" | "deep";
  scale?: "0-100" | "0-10";
  language?: string;
  format?: "markdown" | "json";
  framework?: "swot" | "porter";
  temperature?: number;
};

export type BitrixDealGET = {
  id: string;
  dealCaption: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  askingPrice?: number;
  sourceWebsite: string;
  companyLocation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  workPhone?: string;
  brokerage: string;
  dealType: "MANUAL";
};

export type DealScreenersGET =
  | {
      id: string;
      name: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }[]
  | null;
