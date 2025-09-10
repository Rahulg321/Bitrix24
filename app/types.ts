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
// User type from Prisma Rollup relation
export interface RollupUser {
  id: string;
  name?: string | null;
  email: string;
  role?: "USER" | "ADMIN"; // matches your Prisma enum
}

// Deal type from Prisma Rollup relation
export interface RollupDeal {
  id: string;
  brokerage: string;
  firstName?: string | null;
  lastName?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
  workPhone?: string | null;
  dealCaption: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  title?: string | null;
  grossRevenue?: number | null;
  askingPrice?: number | null;
  industry: string;
  sourceWebsite: string;
  companyLocation?: string | null;
  dealTeaser?: string | null;
  bitrixLink?: string | null;
  status?: "AVAILABLE" | "SOLD" | "UNDER_CONTRACT" | "NOT_SPECIFIED";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Rollup type
export interface RollupDetails {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deals: RollupDeal[];
  users: RollupUser[];
}

// API response type
export interface RollupDetailsResponse {
  rollup: RollupDetails | null;
  error?: string;
};



// User type from Prisma Rollup relation
export interface RollupUser {
  id: string;
  name?: string | null;
  email: string;
  role?: "USER" | "ADMIN"; // matches your Prisma enum
}

// Deal type from Prisma Rollup relation
export interface RollupDeal {
  id: string;
  brokerage: string;
  firstName?: string | null;
  lastName?: string | null;
  linkedinUrl?: string | null;
  email?: string | null;
  workPhone?: string | null;
  dealCaption: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  title?: string | null;
  grossRevenue?: number | null;
  askingPrice?: number | null;
  industry: string;
  sourceWebsite: string;
  companyLocation?: string | null;
  dealTeaser?: string | null;
  bitrixLink?: string | null;
  status?: "AVAILABLE" | "SOLD" | "UNDER_CONTRACT" | "NOT_SPECIFIED";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Rollup type
export interface RollupDetails {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deals: RollupDeal[];
  users: RollupUser[];
}

// API response type
export interface RollupDetailsResponse {
  rollup: RollupDetails | null;
  error?: string;
};


