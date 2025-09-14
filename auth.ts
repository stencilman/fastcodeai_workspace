import NextAuth, { type DefaultSession } from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

import { getUserById } from "@/data/user";
import { UserRole } from "@prisma/client";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },

    async signIn({ user, account, profile, isNewUser }) {
      // console.log("signIn-----> USer", user);
      // console.log("account----->", account);
      // console.log("profile----->", profile);
      // console.log("isNewUser----->", isNewUser);
      if (
        user.email?.includes("prabal@fastcode.ai") ||
        // user.email?.includes("abdul@fastcode.ai") ||
        user.email?.includes("priyanka@fastcode.ai") ||
        user.email?.includes("arjun@fastcode.ai") ||
        user.email?.includes("admin@fastcode.ai")
      ) {
        console.log("Setting role to admin-----******--->", user.email);
        await db.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }

      console.log("isNewUser----->", isNewUser);
      if (isNewUser) {
        if (account?.provider === "google" && profile) {
          const googleProfile = profile as any;
          const firstName = googleProfile.given_name;
          const lastName = googleProfile.family_name;

          await db.user.update({
            where: { id: user.id },
            data: {
              firstName: firstName || null,
              lastName: lastName || null,
            },
          });
        }
      }

      if (!user.id) return;

      return;
    },
  },
  adapter: PrismaAdapter(db),
  callbacks: {
    // This is called when a user tries to sign in and checks if the user email is verified
    async signIn({ user, account, profile }) {
      // console.log("signIn-----> USer", user);

      if (!user.id) return false;

      return true;
    },

    async session({ session, token }) {
      // console.log("sessionToken", token);
      // console.log("session", session);

      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      if (session.user && token.role) {
        session.user.role = token.role as UserRole;
      }

      if (session.user && token.createdAt) {
        session.user.createdAt = token.createdAt as string;
      }

      if (session.user && token.tourCompleted !== undefined) {
        session.user.tourCompleted = token.tourCompleted as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      // Avoid Prisma call when running in Edge runtime (e.g. during middleware)
      if (token.sub && !token.role) {
        if (
          process.env.NEXT_RUNTIME !== "edge" &&
          !(globalThis as any).EdgeRuntime
        ) {
          const dbUser = await getUserById(token.sub).catch(() => null);
          if (dbUser) {
            token.role = dbUser.role;
            token.createdAt = dbUser.createdAt?.toISOString();
            token.tourCompleted = dbUser.tourCompleted;
          }
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
