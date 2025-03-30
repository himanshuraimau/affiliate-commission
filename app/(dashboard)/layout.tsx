"use client";
import { useEffect, useState } from "react"
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
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Only handle redirects once auth state is definitively loaded
    if (!isLoading) {
      // Explicitly define dashboard routes that need protection
      const isDashboardRoute = pathname.startsWith("/dashboard") || 
                              pathname === "/" + pathname.split("/")[1] && 
                              pathname.split("/")[1] !== "" && 
                              !["/login", "/signup", "/"].includes(pathname)
      
      if (!user && isDashboardRoute) {
        router.replace("/login")
      } else if (user && (pathname === "/login" || pathname === "/signup")) {
        router.replace("/dashboard")
      }
      
      setAuthChecked(true)
    }
  }, [user, isLoading, router, pathname])

  // Always show loading state until auth is properly checked
  if (isLoading || !authChecked) {
    return <FullPageLoader />
  }

  // Check if this is a protected route
  const requiresAuth = pathname.startsWith("/dashboard")
  
  // Don't render dashboard for unauthenticated users on protected routes
  if (!user && requiresAuth) {
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