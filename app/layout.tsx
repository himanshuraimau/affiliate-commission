import type React from "react"
import { Inter } from "next/font/google"
import { Providers } from "@/lib/providers"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Affiliate Commission System",
  description: "Manage affiliate commissions and payouts"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}