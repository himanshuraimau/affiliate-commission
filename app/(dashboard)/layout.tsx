"use client";
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  const pathname = usePathname()

  useEffect(() => {
    // Protect only dashboard routes, not public routes
    if (!isLoading) {
      if (!user && pathname.startsWith("/dashboard")) {
        router.replace("/login")
      } else if (user && (pathname === "/login" || pathname === "/signup")) {
        router.replace("/dashboard")
      }
    }
  }, [user, isLoading, router, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return <FullPageLoader />
  }

  // Don't render anything if not authenticated and trying to access dashboard
  if (!user && pathname.startsWith("/dashboard")) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <AffiliateDashboardSidebar />
      <main className="flex-1 p-6 md:p-8 pt-6 md:overflow-y-auto">
        {children}
      </main>
    </div>
  )
}