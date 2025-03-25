"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"
import { useConversionRates } from "@/lib/api/hooks"

export function ConversionRateChart() {
  const { data, isLoading, error } = useConversionRates()
  
  // Log data for debugging
  console.log("Conversion rate data:", data)
  
  // Prepare data for chart - ensure proper structure
  const chartData = data && data.length > 0 ? 
    data.map((item: { date: any; rate: any }) => ({
      date: item.date,
      rate: typeof item.rate === 'number' ? item.rate : 0
    }))
    : [];
  
  // Check if we have valid data to display
  const hasValidData = chartData && chartData.length > 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate</CardTitle>
          <CardDescription>Error loading conversion data</CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-muted-foreground">Failed to load chart data</p>
        </CardContent>
      </Card>
    )
  }
  
  if (!hasValidData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate</CardTitle>
          <CardDescription>No conversion data available for the selected period</CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Rate</CardTitle>
        <CardDescription>
          Percentage of clicks that resulted in a purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                // Handle both string dates and Date objects
                const date = typeof value === 'string' ? new Date(value) : value;
                return date instanceof Date && !isNaN(date.getTime()) 
                  ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : '';
              }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => {
                const date = typeof label === 'string' ? new Date(label) : label;
                return date instanceof Date && !isNaN(date.getTime())
                  ? date.toLocaleDateString()
                  : '';
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              name="Conversion Rate"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
