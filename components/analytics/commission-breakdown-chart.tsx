"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { useCommissionBreakdown } from "@/lib/api/hooks"

// Colors for the pie chart - enhanced color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Define the data type for commission breakdown
interface CommissionBreakdownItem {
  name: string;
  value: number;
}

export function CommissionBreakdownChart() {
  const { data, isLoading, error } = useCommissionBreakdown()
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="h-[400px]"> {/* Increased height */}
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
          <CardDescription>Error loading commission data</CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <p className="text-muted-foreground">Failed to load chart data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Commission Breakdown</CardTitle>
        <CardDescription>
          Distribution of commissions by payment method and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Increased height */}
        <ResponsiveContainer width="106%" height={400}>
          <PieChart>
            <Pie
              data={data as CommissionBreakdownItem[]}
              cx="50%"
              cy="45%" /* Adjusted for better vertical centering */
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={150} /* Increased radius */
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              paddingAngle={2} /* Added padding between segments */
            >
              {(data as CommissionBreakdownItem[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
