import type React from "react"
import { AffiliateDashboardSidebar } from "@/components/affiliates/affiliate-dashboard-sidebar"
import { Inter } from "next/font/google"
import { Providers } from "@/lib/providers"
import "./globals.css"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Affiliate Commission System",
  description: "Manage affiliate commissions and payouts",
  generator: 'v0.dev'
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
          <div className="flex min-h-screen">
            <AffiliateDashboardSidebar />
            <main className="flex-1 p-6 md:p-8 pt-6 md:overflow-y-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}