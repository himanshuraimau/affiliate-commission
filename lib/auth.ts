import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // Add your auth configuration here
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  // Add providers and callbacks as needed
}
