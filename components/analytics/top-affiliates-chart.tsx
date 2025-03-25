"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useTopAffiliates } from "@/lib/api/hooks"

export function TopAffiliatesChart() {
  const { data, isLoading, error } = useTopAffiliates()
  
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
          <CardTitle>Top Affiliates</CardTitle>
          <CardDescription>Error loading affiliates data</CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-muted-foreground">Failed to load chart data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Affiliates</CardTitle>
        <CardDescription>
          Top 10 performing affiliates by revenue generated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 60, // Increased left margin for longer affiliate names
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              width={100}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar 
              dataKey="revenue" 
              name="Revenue Generated" 
              fill="#6366f1" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
