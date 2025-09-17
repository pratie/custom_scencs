import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
}