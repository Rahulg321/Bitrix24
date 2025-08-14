import GitHub from "next-auth/providers/github";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import prismaDB from "./lib/prisma.server";
import { UserRole } from "@prisma/client";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
} satisfies NextAuthConfig;
