"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AffiliateDashboardSidebar } from "@/components/affiliates/affiliate-dashboard-sidebar"
import { useAuth } from "@/lib/auth-context"
import { FullPageLoader } from "@/components/ui/loading"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return <FullPageLoader />
  }

  return (
    <div className="flex min-h-screen">
      <AffiliateDashboardSidebar />
      <main className="flex-1 p-6 md:p-8 pt-6 md:overflow-y-auto">{children}</main>
    </div>
  )
}
