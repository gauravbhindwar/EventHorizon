import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// AuthOptions configuration for NextAuth
export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, user }) {
      // Ensure session object and user are defined
      if (session && session.user && user) {
        session.user.id = user.id; // Assuming user.id is available
      } else {
        console.error("Session or user is undefined");
      }
      return session;
    },
  },
};
