"use client"

import { Users, ShoppingCart, CreditCard, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { useDashboardStats } from "@/lib/api/hooks"
import { useEffect } from "react"

export function DashboardCards() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats()
  
  // Debug logging to diagnose API response issues
  useEffect(() => {
    if (stats) {
      console.log("Dashboard stats received:", stats)
    }
    if (error) {
      console.error("Dashboard stats error:", error)
    }
  }, [stats, error])

  // Add an auto-retry for better data loading reliability
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        console.log("Retrying dashboard stats fetch...")
        refetch()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, refetch])
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Unable to fetch statistics</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Safely access nested properties with fallbacks to zero
  const safeData = {
    totalAffiliates: stats?.totalAffiliates || 0,
    activeAffiliates: stats?.activeAffiliates || 0,
    totalConversions: stats?.totalConversions || 0,
    pendingConversions: stats?.pendingConversions || 0,
    totalRevenue: typeof stats?.totalRevenue === 'number' ? stats.totalRevenue : 0,
    totalCommissions: typeof stats?.totalCommissions === 'number' ? stats.totalCommissions : 0,
    pendingPayouts: typeof stats?.pendingPayouts === 'number' ? stats.pendingPayouts : 0,
    conversionRate: typeof stats?.conversionRate === 'number' ? stats.conversionRate : 0,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeData.totalAffiliates}</div>
          <p className="text-xs text-muted-foreground">{safeData.activeAffiliates} active affiliates</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeData.totalConversions}</div>
          <p className="text-xs text-muted-foreground">{safeData.pendingConversions} pending approval</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(safeData.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(safeData.totalCommissions)} in commissions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(safeData.pendingPayouts)}</div>
          <p className="text-xs text-muted-foreground">
            {safeData.conversionRate.toFixed(1)}% conversion rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

