import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // For beta, simplified auth - just find or create user
        const username = credentials.username as string;
        const email = credentials.email as string;
        
        if (!username && !email) return null;

        // Try to find existing user
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              username ? { username } : {},
              email ? { email } : {},
            ].filter(Boolean),
          },
        });

        // If user doesn't exist, create one (beta: no password check)
        if (!user) {
          user = await prisma.user.create({
            data: {
              username: username || email?.split("@")[0] || `user${Date.now()}`,
              email: email || undefined,
              name: username || email?.split("@")[0] || "User",
            },
          });
        }

        return {
          id: user.id,
          email: user.email || undefined,
          name: user.name || undefined,
          image: user.avatar || undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

