import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prismaDB from "./lib/prisma";
import { User, UserRole } from "@prisma/client";
import authConfig from "./auth.config";
import { getCurrentUserByEmail } from "./lib/data/current-user";

const adminEmails = [
  "rg5353070@gmail.com",
  "destiny@darkalphacapital.com",
  "daigbe@darkalphacapital.com",
  "daigbe@gmail.com",
  "ayan@darkalphacapital.com",
  "kshah77@asu.edu"
];

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      isOAuth: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prismaDB),


  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 0,             
  },

  pages: {
    signIn: "/auth/login",
    error:  "/auth/error",
  },

  events: {
    async linkAccount({ user }) {
      await prismaDB.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.sub!;
        session.user.role  = token.role  as UserRole;
        session.user.image = token.image as string;
      }
      return session;
    },

    async signIn({ user }) {
      const currentUser = await getCurrentUserByEmail(user.email!);
      if (currentUser?.isBlocked) return false;
      return true;
    },

    async jwt({ token }) {
      if (token.sub) {
        const dbUser = await prismaDB.user.findUnique({
          where: { id: token.sub },
          select: { role: true, image: true },
        });
        if (dbUser) {
          token.role  = dbUser.role;
          token.image = dbUser.image;
        }
      }
      return token;
    },
  },

  ...authConfig,
});