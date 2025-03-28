import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your credential verification logic here
        if (!credentials?.email || !credentials?.password) return null
        
        // Example user object - replace with your actual authentication
        const user = { id: "1", email: credentials.email, name: "User" }
        return user
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  session: {
    strategy: "jwt"
  }
}
