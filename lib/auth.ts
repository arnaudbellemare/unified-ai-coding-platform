import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
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
})

export const authOptions = {
  // For backward compatibility
}
