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
    // Simple redirect for unauthenticated users
    if (!isLoading && !user && pathname.startsWith("/dashboard")) {
      router.replace("/login")
    }
  }, [user, isLoading, router, pathname])

  // Show loading state while checking auth
  if (isLoading) {
    return <FullPageLoader />
  }

  // For dashboard routes, require authentication
  if (!user && pathname.startsWith("/dashboard")) {
    return <FullPageLoader /> // Show loading while redirecting
  }

  return (
    <div className="flex min-h-screen">
      {/* Only show sidebar if user is logged in */}
      {user && <AffiliateDashboardSidebar />}
      <main className="flex-1 p-6 md:p-8 pt-6 md:overflow-y-auto">
        {children}
      </main>
    </div>
  )
}