"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BarChart3, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  Users 
} from "lucide-react"
import { useAnalyticsOverview } from "@/lib/api/hooks"
import { formatCurrency } from "@/lib/utils"

export function AnalyticsMetricsCards() {
  const { data, isLoading, error } = useAnalyticsOverview()
  
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-1 h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Failed to load analytics data. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            <span className={data.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
              {data.revenueGrowth > 0 ? "+" : ""}
              {data.revenueGrowth.toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            <span className={data.conversionRateChange >= 0 ? "text-green-500" : "text-red-500"}>
              {data.conversionRateChange > 0 ? "+" : ""}
              {data.conversionRateChange.toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeAffiliates}</div>
          <p className="text-xs text-muted-foreground">
            <span className={data.affiliatesGrowth >= 0 ? "text-green-500" : "text-red-500"}>
              {data.affiliatesGrowth > 0 ? "+" : ""}
              {data.affiliatesGrowth.toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Commission</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.averageCommission)}</div>
          <p className="text-xs text-muted-foreground">
            <span className={data.averageCommissionChange >= 0 ? "text-green-500" : "text-red-500"}>
              {data.averageCommissionChange > 0 ? "+" : ""}
              {data.averageCommissionChange.toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
