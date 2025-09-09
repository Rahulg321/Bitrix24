import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prismaDB from "./lib/prisma";
import { User, UserRole } from "@prisma/client";
import authConfig from "./auth.config";
import { getCurrentUserByEmail } from "./lib/data/current-user";

const adminEmails = [
  "rg5353070@gmail.com",
  "amani.151413@gmail.com",
  "rahul@darkalphacapital.com",
  "destiny@darkalphacapital.com",
  "daigbe@darkalphacapital.com",
  "diligence@darkalphacapital.com",
  "da@darkalphacapital.com",
  "daigbe@gmail.com",
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
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    //this event is only triggered when we use an OAuth provider
    async linkAccount({ user }) {
      await prismaDB.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },

  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.image && session.user) {
        session.user.image = token.image as string;
      }

      return session;
    },
    async signIn({ user, account }) {
      const userEmail = user.email;
      const currentUser = await getCurrentUserByEmail(userEmail!);

      if (currentUser?.isBlocked) {
        return false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (!token.sub) return token;

      // If there's a user object, it means the user signed in
      // Update user role on every sign in
      if (user) {
        const userRole = determineRole(user.email!);
        token.role = userRole;
        await prismaDB.user.update({
          where: {
            id: user.id,
          },
          data: {
            role: userRole,
          },
        });
      }

      const existingUser = await prismaDB.user.findUnique({
        where: {
          id: token.sub,
        },
      });

      if (!existingUser) return token;

      token.image = existingUser.image;
      token.id = existingUser.id;

      return token;
    },
  },
  ...authConfig,
});

/**
 * determine the role of the user based on their email
 *
 * @param userEmail - the email of the user
 * @returns the role of the user
 */
function determineRole(userEmail: string) {
  if (adminEmails.includes(userEmail)) {
    return UserRole.ADMIN;
  } else {
    return UserRole.USER;
  }
}
