"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalyticsFilter } from "./analytics-filter-context"
import { useRevenueOverTime, useConversionRates, useTopAffiliates } from "@/lib/api/hooks"
import { Skeleton } from "@/components/ui/skeleton"

// Format date for API
const formatDateParam = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export function RevenueChart() {
  const { dateRange, comparisonRange, enableComparison } = useAnalyticsFilter()
  
  // Fetch data using the date ranges
  const { data: currentData, isLoading: isLoadingCurrent } = useRevenueOverTime(
    formatDateParam(dateRange.from), 
    formatDateParam(dateRange.to)
  )
  
  // Fetch comparison data if needed
  const { data: comparisonData, isLoading: isLoadingComparison } = useRevenueOverTime(
    enableComparison && comparisonRange ? formatDateParam(comparisonRange.from) : undefined,
    enableComparison && comparisonRange ? formatDateParam(comparisonRange.to) : undefined,
    { enabled: enableComparison && !!comparisonRange }
  )
  
  const isLoading = isLoadingCurrent || (enableComparison && isLoadingComparison)
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Loading revenue data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>
          {enableComparison && comparisonRange 
            ? `Comparing ${formatDateParam(dateRange.from)} - ${formatDateParam(dateRange.to)} with ${formatDateParam(comparisonRange.from)} - ${formatDateParam(comparisonRange.to)}`
            : `${formatDateParam(dateRange.from)} - ${formatDateParam(dateRange.to)}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Render your chart with the data */}
        {/* <LineChart 
          data={currentData} 
          comparisonData={enableComparison ? comparisonData : undefined} 
        /> */}
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Chart would render here with the filtered data</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Add similar components for conversion rates, top affiliates, etc.
