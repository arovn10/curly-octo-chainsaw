import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" }, // or 'jwt' if you prefer
  providers: [
    // Enable providers you actually configured in .env
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
      : (null as any),

    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY
      ? AppleProvider({
          clientId: process.env.APPLE_CLIENT_ID!,
          teamId: process.env.APPLE_TEAM_ID!,
          privateKey: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
          keyId: process.env.APPLE_KEY_ID!,
        })
      : (null as any),

    // Optional: email magic links
    process.env.EMAIL_SERVER_HOST
      ? EmailProvider({
          server: {
            host: process.env.EMAIL_SERVER_HOST!,
            port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
            auth: {
              user: process.env.EMAIL_SERVER_USER!,
              pass: process.env.EMAIL_SERVER_PASSWORD!,
            },
          },
          from: process.env.EMAIL_FROM!,
        })
      : (null as any),
  ].filter(Boolean),
  pages: {
    signIn: "/signin", // create a simple page if you want custom UI
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // expose user id client-side
        // @ts-ignore
        session.user.id = user.id;
      }
      return session;
    },
  },
  // recommended: set a secret
  secret: process.env.NEXTAUTH_SECRET,
};

