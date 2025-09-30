import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'your_github_client_id_here',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret_here',
      authorization: {
        params: {
          scope: 'repo user',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Add access token to session
      if (token.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
